import sys
import numpy as np
from PIL import Image, ImageOps
import skimage
import matplotlib.pyplot as plt
import cv2
import os
import pathlib
import torch
from torchvision import transforms
from PIL import Image, ImageDraw, ImageFont

def calc_coefficents(hr, lr):
    return [(hr.shape[0]+2)/lr.shape[0], (hr.shape[1]+2)/lr.shape[1]]

def convert_to_uint8(im):
    rgb = im / np.max(im)
    rgb = np.uint8(255 * rgb)
    return rgb

def get_path_file_ext(e):
    file_name, ext = os.path.splitext(e)
    path = os.path.dirname(file_name) + '/'
    file = os.path.basename(file_name)
    return path, file, ext

def equalization(rgb):
    adapt_hist = skimage.exposure.equalize_adapthist(rgb)
    adapt_hist = adapt_hist / np.max(adapt_hist)
    adapt_hist = np.uint8(255 * adapt_hist)
    return adapt_hist

def save_im(pil_im, name):
    img.save(name)

def display_side_to_side(im1, im2, name=None):
    side2side = Image.fromarray(np.hstack((np.array(im1),np.array(im2))))
    side2side.show()

def hist_match(source, template):
    source = source.astype("float64");
    template = template.astype("float64");

    oldshape = source.shape
    source = source.ravel()
    template = template.ravel()

    # counts
    s_values, bin_idx, s_counts = np.unique(source, return_inverse=True,
                                            return_counts=True)
    t_values, t_counts = np.unique(template, return_counts=True)
    s_quantiles = np.cumsum(s_counts).astype(np.float64)
    s_quantiles /= s_quantiles[-1]
    t_quantiles = np.cumsum(t_counts).astype(np.float64)
    t_quantiles /= t_quantiles[-1]

    interp_t_values = np.interp(s_quantiles, t_quantiles, t_values)

    return interp_t_values[bin_idx].reshape(oldshape)

def convert_to_hsv(rgb):
    return cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)

if __name__ == '__main__':
    hr_root_path = "../data/hr_dataset/12bit/"
    lrs_root_path = "../data/lr_dataset/"

    dirs = sorted(os.listdir(lrs_root_path))

    for dir in dirs:
        if dir.startswith('.DS_Store'):
            continue
        # Read HR
        hr_path = os.path.join(hr_root_path, dir, "{}_ps.tiff".format(dir))
        hr = skimage.io.imread(hr_path)
        hr = hr[:, :, 0:3]
        hr = convert_to_uint8(hr)
        # Read LRs
        lrs_path = os.path.join(lrs_root_path, dir)
        lrs = []
        for i in range(1, 16):
            lr_path = os.path.join(lrs_path, "L2A", "{}-{}-L2A_data.tiff".format(dir, i))
            if not os.path.exists(lr_path):
                print("Unable to get {} nº {}".format(dir, i))
                break
            print(lr_path)
            lr = skimage.io.imread(lr_path)
            lr = lr[:, :, 1:4][:, :, ::-1]
            lr = convert_to_uint8(lr)
            lrs.append(np.array(lr))

        hrs = [hr]
        best_psnr_idx = 0
        best_psnr = 0
        i = 0
        for lr in lrs:
            # Use as reference first image of the LR set
            ref_hsv = cv2.cvtColor(lr, cv2.COLOR_RGB2HSV)

            # Transform HR to HSV
            hr_hsv = cv2.cvtColor(hr, cv2.COLOR_RGB2HSV)
            hr_hsv[:,:,-1] = hist_match(hr_hsv[:,:,-1], ref_hsv[:,:,-1])
            hr_rgb = cv2.cvtColor(hr_hsv, cv2.COLOR_HSV2RGB)

            # Calculate the PSNR with the Ground Truth
            resized_hr = (transforms.Resize(lr.shape[:2], Image.BICUBIC)(Image.fromarray(hr_rgb)))
            psnr = skimage.metrics.peak_signal_noise_ratio(np.array(resized_hr), lr)

            # Add a label to the image (30 mins of my life spent in this useless thing)
            hr_rgb = Image.fromarray(hr_rgb)
            draw = ImageDraw.Draw(hr_rgb)
            font_size = 100
            font_type = "/Library/Fonts/Arial Unicode.ttf"
            text = str(i)
            text_position = (10, 10)
            text_color = (255, 255, 255)
            font = ImageFont.truetype(font_type, font_size)
            draw.text(text_position, text, font=font, fill=text_color)

            hrs.append(np.array(hr_rgb))
            if best_psnr < psnr:
                best_psnr_idx = i + 1
                best_psnr = psnr

            i += 1

        hrs[best_psnr_idx][:10, :, :] = (0,255,0)
        hrs[best_psnr_idx][-10:, :, :] = (0,255,0)
        hrs[best_psnr_idx][:, :10, :] = (0,255,0)
        hrs[best_psnr_idx][:, -10:, :] = (0,255,0)

        side2sideHR = Image.fromarray(np.hstack((hrs)))
        side2sideHR.show()
        chosen = int(input("From 0 to N, enter the index of reference to be used as equalization: "))

        # Use as reference first image of the LR set
        ref_hsv = cv2.cvtColor(lrs[chosen], cv2.COLOR_RGB2HSV)
        # HR Equalization
        hr_hsv = cv2.cvtColor(hr, cv2.COLOR_RGB2HSV)
        hr_hsv[:,:,-1] = hist_match(hr_hsv[:,:,-1], ref_hsv[:,:,-1])
        hr_rgb = cv2.cvtColor(hr_hsv, cv2.COLOR_HSV2RGB)
        # x6
        hr_rgb_pil = Image.fromarray(hr_rgb)
        hr_path = os.path.join(hr_root_path, dir, "{}_adapted_x6.png".format(dir))
        hr_rgb_pil.save(hr_path)
        # x4
        hr_path = os.path.join(hr_root_path, dir, "{}_adapted_x4.png".format(dir))
        hr_rgb_pil = (transforms.Resize((628,628), Image.BICUBIC)(Image.fromarray(hr_rgb)))
        hr_rgb_pil.save(hr_path)
        # x2
        hr_path = os.path.join(hr_root_path, dir, "{}_adapted_x2.png".format(dir))
        hr_rgb_pil = (transforms.Resize((314,314), Image.BICUBIC)(Image.fromarray(hr_rgb)))
        hr_rgb_pil.save(hr_path)

        for i, lr in enumerate(lrs):
            lr_hsv = cv2.cvtColor(lr, cv2.COLOR_RGB2HSV)
            lr_hsv[:,:,-1] = hist_match(lr_hsv[:,:,-1], ref_hsv[:,:,-1])
            lr_rgb = cv2.cvtColor(lr_hsv, cv2.COLOR_HSV2RGB)
            lr_rgb_pil = Image.fromarray(lr_rgb)
            lr_path = os.path.join(lrs_path, "L2A", "{}-{}-L2A_data_adapted.png".format(dir, i + 1))
            lr_rgb_pil.save(lr_path)