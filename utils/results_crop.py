import argparse
import os
import skimage
import numpy as np
from PIL import Image
import sys

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--res') # x2
    parser.add_argument('--region') # 320,432
    parser.add_argument('--width') # 50
    args = parser.parse_args()

    x = int(args.region.split(',')[0])
    y = int(args.region.split(',')[-1])
    s = int(args.width)

    # python results_crop.py --res "x2" --region 320,432 --width 50
    # will result in a crop from [320:370, 432:482] from the HR
    # then those coords will be converted to LR

    lrs_root_path = "./output/"
    models = sorted(os.listdir(lrs_root_path))
    for model in models:
        if model.startswith('.DS_Store'):
            continue
        print()
        print("--------------------- {} ----------------".format(model))
        dirs = sorted(os.listdir(os.path.join(lrs_root_path, model)))
        for dir in dirs:
            if dir.startswith('.DS_Store'):
                continue
            hr_root_path = "../data/hr_dataset/12bit/{}/{}_adapted_{}.png".format(dir, dir, args.res)
            hr = skimage.io.imread(hr_root_path)
            # hr = hr[x:x+s, y:y+s, :]

            pil_hr = Image.fromarray(hr)

            lr = skimage.io.imread(os.path.join(lrs_root_path, model, dir, "{}_{}.png".format(dir, args.res)))
            # lr = lr[x:x+s, y:y+s, :]
            pil_lr = Image.fromarray(lr)

            psnr = skimage.metrics.peak_signal_noise_ratio(lr, hr)
            print("[{:10}] {:20}: {:10}".format(model, dir, psnr))

            hr_root_path = "../data/hr_dataset/12bit/{}/{}_adapted_x2_CROPPED.png".format(dir, dir)
            pil_hr.save(hr_root_path)
            pil_lr.save(os.path.join(lrs_root_path, model, dir, "{}_{}_CROPPED.png".format(dir, args.res)))
