import sys
import os
import math
import skimage
import numpy as np
from PIL import Image
from torchvision import transforms

'''
Interpolation script using the Bicubic interpolation primitive from torchvision and PIL.

Pre-requisites:
    data-adaptation.py
    temporal-5-subset.py
'''

if __name__ == '__main__':
    hr_root_path = "../data/hr_dataset/12bit/"
    lrs_root_path = "../temporal_dataset/"

    dirs = sorted(os.listdir(lrs_root_path))

    overall_mse = []
    overall_psnr = []

    for dirname in dirs:
        if dirname.startswith('.DS_Store'):
            continue

        lrs_x2  = []
        lrs_x4  = []
        lrs_x6  = []

        lrs     = []

        mse_x2  = []
        mse_x4  = []
        mse_x6  = []

        psnr_x2 = []
        psnr_x4 = []
        psnr_x6 = []

        # Read HRs
        hr_x2_path = os.path.join(hr_root_path, dirname, "{}_adapted_x2.png".format(dirname))
        hr_x4_path = os.path.join(hr_root_path, dirname, "{}_adapted_x4.png".format(dirname))
        hr_x6_path = os.path.join(hr_root_path, dirname, "{}_adapted_x6.png".format(dirname))

        if not os.path.exists(hr_x2_path) or not os.path.exists(hr_x4_path) or not os.path.exists(hr_x6_path):
            print("HR is not available")
            break

        # Read HRs
        hr_x2 = skimage.io.imread(hr_x2_path)
        hr_x4 = skimage.io.imread(hr_x4_path)
        hr_x6 = skimage.io.imread(hr_x6_path)

        # Read 5 temporal subset LR
        for i in range(1, 6):
            lr_path = os.path.join(lrs_root_path, dirname, "{}.png".format(i))
            if not os.path.exists(lr_path):
                print("Unable to get {} nº {}".format(dirname, i))
                break
            lr = skimage.io.imread(lr_path)
            lrs.append(np.array(lr))

        
        for lr in lrs:
            interpolation_x2 = np.array(transforms.Resize((314,314), Image.BICUBIC)(Image.fromarray(lr)))
            mse_x2.append(skimage.metrics.mean_squared_error(interpolation_x2, hr_x2))
            psnr_x2.append(skimage.metrics.peak_signal_noise_ratio(interpolation_x2, hr_x2))
            pil_x2 = Image.fromarray(interpolation_x2)
            pil_x2.save(os.path.join('.', 'output', 'bicubic', '{}_x2.png'.format(dirname)))

            interpolation_x4 = np.array(transforms.Resize((628,628), Image.BICUBIC)(Image.fromarray(lr)))
            mse_x4.append(skimage.metrics.mean_squared_error(interpolation_x4, hr_x4))
            psnr_x4.append(skimage.metrics.peak_signal_noise_ratio(interpolation_x4, hr_x4))
            pil_x4 = Image.fromarray(interpolation_x4)
            pil_x4.save(os.path.join('.', 'output', 'bicubic', '{}_x4.png'.format(dirname)))

            interpolation_x6 = np.array(transforms.Resize((1054,1054), Image.BICUBIC)(Image.fromarray(lr)))
            mse_x6.append(skimage.metrics.mean_squared_error(interpolation_x6, hr_x6))
            psnr_x6.append(skimage.metrics.peak_signal_noise_ratio(interpolation_x6, hr_x6))
            pil_x6 = Image.fromarray(interpolation_x6)
            pil_x6.save(os.path.join('.', 'output', 'bicubic', '{}_x6.png'.format(dirname)))

        print("{:<20} & {:>7} & {:>5} & {:>7} & {:>5} & {:>7} & {:>5} \\\\".format(dirname, round(sum(mse_x2) / len(mse_x2), 2), round(sum(psnr_x2) / len(psnr_x2), 2), round(sum(mse_x4) / len(mse_x4), 2), round(sum(psnr_x4) / len(psnr_x4), 2), round(sum(mse_x6) / len(mse_x6), 2), round(sum(psnr_x6) / len(psnr_x6), 2)))
