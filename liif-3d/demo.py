

import argparse
import os
from PIL import Image
import skimage
import numpy as np

import torch
from torchvision import transforms

import models
from utils import make_coord
from test import batched_predict
import warnings

import sys

warnings.filterwarnings("ignore")


if __name__ == '__main__':
    '''
    (TFG Modified)
    '''
    parser = argparse.ArgumentParser()
    parser.add_argument('--input', default='./input')
    parser.add_argument('--model', default='pths/temporal-1d-3346.pth')
    #parser.add_argument('--resolution')
    parser.add_argument('--output', default='./output')
    parser.add_argument('--gpu', default='0')
    args = parser.parse_args()

    os.environ['CUDA_VISIBLE_DEVICES'] = args.gpu
    os.environ["CUDA_DEVICE_ORDER"]="PCI_BUS_ID"

    root_path = args.input
    dirs = sorted(os.listdir(root_path))

    resolutions = {
        "x2": "318,318",
        "x4": "636,636",
        "x6": "1054,1054"
    }

    models_ldict = {}
    for i in range(11,12,1):
        if i == 0:
            i = 1
        models_ldict[str(i)] = "./save/_train-tfg/epoch-{}.pth".format(i)

    for mode in models_ldict:
        model = models.make(torch.load(models_ldict[mode])['model'], load_sd=True).cuda()
        psnr_list_all = []
        psnr_list_x2 = []
        psnr_list_x4 = []
        psnr_list_x6 = []
        for dir in dirs:
            if dir.startswith('.'):
                continue
            filenames = sorted(os.listdir(os.path.join(root_path, dir)))
            # print("DIR: {} ----------------------".format(dir))
            frames = []
            for filename in filenames:
                if filename.startswith('.'):
                    continue
                file = os.path.join(os.path.join(root_path, dir), filename)
                frames.append(transforms.ToTensor()(Image.open(file).convert('RGB')))

            video = torch.stack(frames).permute(1, 0, 2, 3)


            for res in resolutions:

                hr_path = "../hr_dataset/hr_dataset/12bit/{}/{}_adapted_{}.png".format(dir, dir, res)
                hr_im = np.array(Image.open(hr_path))

                h, w = hr_im.shape[:2]
                t = 1

                #t = video.shape[1]
                # h = video.shape[2]
                # w = video.shape[3]

                coord = make_coord((t, h, w)).cuda()
                cell = torch.ones_like(coord)
                cell[:, 0] *= 2 / t
                cell[:, 1] *= 2 / h
                cell[:, 2] *= 2 / w

                pred = \
                batched_predict(model, ((video - 0.5) / 0.5).cuda().unsqueeze(0), coord.unsqueeze(0), cell.unsqueeze(0), bsize=30000)[0]
                pred = (pred * 0.5 + 0.5).clamp(0, 1).view(t, h, w, 3).permute(0,3,1,2).cpu()

                output_path = os.path.join(args.output, dir)


                for i, img in enumerate(pred):
                    pil_pred = np.array(transforms.ToPILImage()(img))
                    mse = skimage.metrics.mean_squared_error(pil_pred, hr_im)
                    psnr = skimage.metrics.peak_signal_noise_ratio(pil_pred, hr_im)
                    if res == "x2":
                        psnr_list_x2.append(psnr)
                    elif res == "x4":
                        psnr_list_x4.append(psnr)
                    elif res == "x6":
                        psnr_list_x6.append(psnr)
                    psnr_list_all.append(psnr)
                    print("[{:<20} \tEpoch {}] {}: {}\tMSE: {} \tPSNR: {}".format(dir, mode, res, resolutions[res], round(mse, 2), round(psnr, 4)))
                    transforms.ToPILImage()(img).save("{}/{}_{}_{}.png".format(output_path, dir, res, mode))
        print("Average Epoch {:<3}: x2 {:<20}  x4 {:<20}  x6 {:<20}  Average all {:<20}".format(mode, sum(psnr_list_x2) / len(psnr_list_x2), sum(psnr_list_x4) / len(psnr_list_x4), sum(psnr_list_x6) / len(psnr_list_x6), sum(psnr_list_all) / len(psnr_list_all)))
    # print("----------------------------------------------")
