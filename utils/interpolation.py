import sys
import numpy as np
from PIL import Image, ImageOps
import skimage
import matplotlib.pyplot as plt
import cv2
import os
import pathlib

def read_ims(path_hr, path_lr, xFactor=1):
    # there will always be 1 HR image (SPOT 6/7)
    hr = skimage.io.imread(path_hr)
    hr = hr[:, :, 0:3]
    hr = convert_to_uint8(hr)
    
    # there can be up to 16 LRs images (Sentinel S2 L2A)
    lrs = []
    for lrx in path_lr:
        lr = skimage.io.imread(lrx)
        lr = lr[:, :, 1:4][:, :, ::-1]
        lrs.append(convert_to_uint8(lr))
                 
    if xFactor != 1:
        coef_lr = max(lr[0].shape[:2]) * xFactor
        hr = np.array(Image.fromarray(hr).resize((coef_lr, coef_lr)))

    return hr, lrs

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

def interpolation(command):
    os.system(command)

def mae_psnr(transfer, inter):
    mse = skimage.metrics.mean_squared_error(inter_1, transfer)
    psnr = skimage.metrics.peak_signal_noise_ratio(transfer, inter_1)
    print("mse: ", mse)
    print("psnr: ", psnr)
    return mse, psnr
    
if __name__ == '__main__':
    # Arguments
    path_hrs = [
        # "Amnesty_POI-6-3-3",
        # "Amnesty_POI-8-1-1",
        # "Amnesty_POI-13-1-1",
        # "Landcover-8732", 
        # "Landcover-14956", 
        # "Landcover-31746", 
        # "Landcover-461460",
        # "Landcover-769356",
        # "Landcover-770156",
        # "Landcover-771435",
        # "Landcover-772421",
        # "Landcover-777404",
        # "Landcover-1864782",
        "UNHCR-AFGs000003",
        "UNHCR-CODs026828",
        "UNHCR-NERs009694",
        "UNHCR-NGAs036019",
        "UNHCR-TGOs003383",
    ]

    
    for name_hr in path_hrs:
        mse_arr = []
        psnr_arr = []
        path_lr = []
        with open("Output.txt", "a") as text_file:
            text_file.write("\n\n~~~~~~~~~ {} ~~~~~~~~\n".format(name_hr))
        path_hr = "./data/hr_dataset/12bit/{}/{}_ps.tiff".format(name_hr, name_hr)
        for i in range(1,8+1):
            path_lr.append("./data/lr_dataset/{}/L2A/{}-{}-L2A_data.tiff".format(name_hr, name_hr, i))
        
        print(path_lr)
        # spatial is calculated on the fly with the hr/lr
        # temporal = 1 if len(path_lr) > 1 else 0
        temporal = 0
        spectral = 1

        hr_rgb, lrs_rgb = read_ims(path_hr, path_lr, 2)

        coef = calc_coefficents(hr_rgb, lrs_rgb[0])

        # Use as reference first image of the LR set
        ref = lrs_rgb[0]
        ref_hsv = cv2.cvtColor(ref, cv2.COLOR_RGB2HSV)

        # If we wanted to use the hr as reference...
        # ref = hr_rgb
        # ref_hsv = cv2.cvtColor(ref, cv2.COLOR_RGB2HSV)

        # we don't use equalization because we are modifying our ground truth
        # ref = equalization(lrs_rgb[0]) 
        # ref_hsv = cv2.cvtColor(ref, cv2.COLOR_RGB2HSV)
        # Image.fromarray(adapt_hist).show()

        # Put in correspondence with all the set
        hr_hsv = cv2.cvtColor(hr_rgb, cv2.COLOR_RGB2HSV)
        hr_hsv[:,:,-1] = hist_match(hr_hsv[:,:,-1], ref_hsv[:,:,-1])
        hr_rgb = cv2.cvtColor(hr_hsv, cv2.COLOR_HSV2RGB)
        im_hr_rgb = Image.fromarray(hr_rgb)

        imhist_path = []
        inter_out_path = []

        for i, lr in enumerate(lrs_rgb):
            lr_hsv = cv2.cvtColor(lr, cv2.COLOR_RGB2HSV)
            lr_hsv[:,:,-1] = hist_match(lr_hsv[:,:,-1], ref_hsv[:,:,-1])
            lr_rgb = cv2.cvtColor(lr_hsv, cv2.COLOR_HSV2RGB)
            img = Image.fromarray(lr_rgb)
            imhist_lr_name = str(pathlib.Path().resolve()) + (os.path.splitext(path_lr[i])[0] + '_adapted' + os.path.splitext(path_lr[i])[1])[1:]
            imhist_path.append(imhist_lr_name)
            print("Saved Hist Matched: ", imhist_lr_name)
            for te in range(temporal + 1):
                p, f, e = get_path_file_ext(imhist_lr_name)
                inter_out_path.append(p + "INTER_" + f + "_temp_" + str(te) + ".png")
                if i == len(lrs_rgb) - 1:
                    break
            img.save(imhist_lr_name)

        # Aplicar inter
        command = "/usr/local/bin/python3.10 ./metrics_notebook/interpn.py {} {} {} {} {} {}".format(len(imhist_path), ' '.join(imhist_path), coef[0], coef[1], temporal, spectral)
        print(command)
        os.system(command)

        # Sacar metricas
        for out in inter_out_path:
            inter = skimage.io.imread(out)
            im_inter = Image.fromarray(inter)
            print(np.array(im_hr_rgb).shape)
            print(np.array(im_inter).shape)
            # display_side_to_side(im_hr_rgb, im_inter)
            p, f, e = get_path_file_ext(out)
            print("~~~~~~~~~~~~~~", f, "~~~~~~~~~~~~~~")
            mse = skimage.metrics.mean_squared_error(inter, hr_rgb)
            psnr = skimage.metrics.peak_signal_noise_ratio(inter, hr_rgb)
            with open("Output.txt", "a") as text_file:
                text_file.write("{} \t mse: {} \t psnr: {}\n".format(f, mse, psnr))
            print("mse: ", mse, "\tpsnr: ", psnr)
            mse_arr.append(mse)
            psnr_arr.append(psnr)
            
        with open("Output.txt", "a") as text_file:
            text_file.write("MEAN MSE: {} \t MEAN PSNR: {} \nMIN MSE: {} \t MIN PSNR: {}\n".format(str(sum(mse_arr) / len(mse_arr)), str(sum(psnr_arr) / len(psnr_arr)), str(sum(mse_arr) / len(mse_arr)), str(sum(psnr_arr) / len(psnr_arr))))
        
