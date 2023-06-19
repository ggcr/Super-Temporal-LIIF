import functools
import random
import math
from PIL import Image

import numpy as np
import torch
from torch.utils.data import Dataset
from torchvision import transforms

from datasets import register
from utils import to_pixel_samples

import sys


@register('sr-implicit-paired')
class SRImplicitPaired(Dataset):

    def __init__(self, dataset, inp_size=None, temporal_strat=None, augment=False, sample_q=None):
        self.dataset = dataset
        self.inp_size = inp_size
        self.temporal_strat = temporal_strat
        self.augment = augment
        self.sample_q = sample_q

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        img_lr, img_hr = self.dataset[idx]

        s = img_hr.shape[-2] // img_lr.shape[-2] # assume int scale
        if self.inp_size is None:
            h_lr, w_lr = img_lr.shape[-2:]
            img_hr = img_hr[:, :h_lr * s, :w_lr * s]
            crop_lr, crop_hr = img_lr, img_hr
        else:
            w_lr = self.inp_size
            x0 = random.randint(0, img_lr.shape[-2] - w_lr)
            y0 = random.randint(0, img_lr.shape[-1] - w_lr)
            crop_lr = img_lr[:, x0: x0 + w_lr, y0: y0 + w_lr]
            w_hr = w_lr * s
            x1 = x0 * s
            y1 = y0 * s
            crop_hr = img_hr[:, x1: x1 + w_hr, y1: y1 + w_hr]

        if self.augment:
            hflip = random.random() < 0.5
            vflip = random.random() < 0.5
            dflip = random.random() < 0.5

            def augment(x):
                if hflip:
                    x = x.flip(-2)
                if vflip:
                    x = x.flip(-1)
                if dflip:
                    x = x.transpose(-2, -1)
                return x

            crop_lr = augment(crop_lr)
            crop_hr = augment(crop_hr)

        hr_coord, hr_rgb = to_pixel_samples(crop_hr.contiguous())

        if self.sample_q is not None:
            sample_lst = np.random.choice(
                len(hr_coord), self.sample_q, replace=False)
            hr_coord = hr_coord[sample_lst]
            hr_rgb = hr_rgb[sample_lst]

        cell = torch.ones_like(hr_coord)
        cell[:, 0] *= 2 / crop_hr.shape[-2]
        cell[:, 1] *= 2 / crop_hr.shape[-1]

        return {
            'inp': crop_lr,
            'coord': hr_coord,
            'cell': cell,
            'gt': hr_rgb
        }


def resize_fn(img, size):
    return transforms.ToTensor()(
        transforms.Resize(size, Image.BICUBIC)(
            transforms.ToPILImage()(img)))


@register('sr-implicit-downsampled')
class SRImplicitDownsampled(Dataset):

    def __init__(self, dataset, inp_size=None, temporal_strat=None, scale_min=1, scale_max=None,
                 augment=False, sample_q=None):
        self.dataset = dataset
        self.inp_size = inp_size
        self.temporal_strat = temporal_strat
        self.scale_min = scale_min
        if scale_max is None:
            scale_max = scale_min
        self.scale_max = scale_max
        self.augment = augment
        self.sample_q = sample_q

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        '''
        (TFG Modified)
        We recieve at index 0 the 5 temporal samples LR (Sentinel 150x150), and at index 1 the HR (SPOT 6/7 1050x1050).
        We will define our HR as a random crop of the 3rd temporal sample (128x128) and downsample the LRs to x2, x3 or x4, uniformly varied random.
        '''
        lrs = self.dataset[idx][0]
        gt = self.dataset[idx][1]
        gt = transforms.ToTensor()(transforms.Resize((lrs[2, :, :, :].shape[-2], lrs[2, :, :, :].shape[-1]), Image.BICUBIC)(transforms.ToPILImage()(gt)))

        # Random crop of all the temporal samples to 128x128
        pix = self.inp_size
        x0 = random.randint(0, lrs[2, :, :, :].shape[-2] - pix)
        y0 = random.randint(0, lrs[2, :, :, :].shape[-1] - pix)

        cropped_lrs = lrs
        crop_hr = gt[:, x0:x0+pix, y0:y0+pix]
        # transforms.ToPILImage()(crop_hr).save("output/{}_hr_{}.png".format(idx, "1"))
        crop_hr = crop_hr.unsqueeze(1)

        # Downscale randomly 1x - 4x
        s = random.uniform(1, 4)
        h_lr = math.floor(cropped_lrs.shape[-2] / s + 1e-9)
        w_lr = math.floor(cropped_lrs.shape[-1] / s + 1e-9)


        lrs_down = torch.empty((5, 3, h_lr, w_lr))

        for t in range(lrs.shape[0]):
            lrs_down[t] = transforms.ToTensor()(transforms.Resize((h_lr, w_lr), Image.BICUBIC)(transforms.ToPILImage()(lrs[t, :, x0:x0+pix, y0:y0+pix])))
            # transforms.ToPILImage()(lrs_down[t]).save("output/{}_lr_{}.png".format(idx, t))

        # transforms.ToPILImage()(hr).save("output/{}_hr.png".format(idx))

        if self.temporal_strat == "complete":
            # Do nothing, keep all the images
            pass
        elif self.temporal_strat == "groups":
            t0 = random.randint(0, lrs_down.shape[0]-2)
            t1 = random.randint(t0+2, lrs_down.shape[0])
            lrs_down = lrs_down[t0:t1+1]
        elif self.temporal_strat == "pairs":
            t0 = random.randint(0, lrs_down.shape[0]-2)
            t1 = t0 + 2
            lrs_down = lrs_down[t0:t1]
        elif self.temporal_strat == "single":
            t0 = random.randint(0, lrs_down.shape[0]-1)
            lrs_down = lrs_down[t0]
            lrs_down = lrs_down.unsqueeze(0)

        lrs_down = lrs_down.permute(1,0,2,3) # (color, t, x, y)

        if self.augment:
            hflip = random.random() < 0.5
            vflip = random.random() < 0.5
            dflip = random.random() < 0.5
            tflip = random.random() < 0.5

            def augment(x, isLR):
                if hflip:
                    x = x.flip(-2)
                if vflip:
                    x = x.flip(-1)
                if dflip:
                    x = x.transpose(-2, -1)
                if tflip and isLR:
                    x = x.flip(-3)
                return x

            lrs_down = augment(lrs_down, True)
            crop_hr = augment(crop_hr, False)

        hr_coord, hr_rgb = to_pixel_samples(crop_hr.contiguous())

        if self.sample_q is not None:
            sample_lst = np.random.choice(
                len(hr_coord), self.sample_q, replace=False)
            hr_coord = hr_coord[sample_lst]
            hr_rgb = hr_rgb[sample_lst]

        cell = torch.ones_like(hr_coord)
        cell[:, 0] *= 2 / 1 # t = 1
        cell[:, 1] *= 2 / crop_hr.shape[-2]
        cell[:, 2] *= 2 / crop_hr.shape[-1]


        return {
            'inp': lrs_down,
            'coord': hr_coord,
            'cell': cell,
            'gt': hr_rgb
        }


@register('sr-implicit-uniform-varied')
class SRImplicitUniformVaried(Dataset):

    def __init__(self, dataset, size_min, size_max=None,
                 augment=False, gt_resize=None, sample_q=None):
        self.dataset = dataset
        self.size_min = size_min
        if size_max is None:
            size_max = size_min
        self.size_max = size_max
        self.augment = augment
        self.gt_resize = gt_resize
        self.sample_q = sample_q

    def __len__(self):
        return len(self.dataset)

    def __getitem__(self, idx):
        img_lr, img_hr = self.dataset[idx]
        p = idx / (len(self.dataset) - 1)
        w_hr = round(self.size_min + (self.size_max - self.size_min) * p)
        img_hr = resize_fn(img_hr, w_hr)

        if self.augment:
            if random.random() < 0.5:
                img_lr = img_lr.flip(-1)
                img_hr = img_hr.flip(-1)

        if self.gt_resize is not None:
            img_hr = resize_fn(img_hr, self.gt_resize)

        hr_coord, hr_rgb = to_pixel_samples(img_hr)

        if self.sample_q is not None:
            sample_lst = np.random.choice(
                len(hr_coord), self.sample_q, replace=False)
            hr_coord = hr_coord[sample_lst]
            hr_rgb = hr_rgb[sample_lst]

        cell = torch.ones_like(hr_coord)
        cell[:, 0] *= 2 / img_hr.shape[-2]
        cell[:, 1] *= 2 / img_hr.shape[-1]

        return {
            'inp': img_lr,
            'coord': hr_coord,
            'cell': cell,
            'gt': hr_rgb
        }
