###################################################################################
#
# This is the script that does interpolation, the script should be used as
# follows: python interpolation.py <input_path> <output_path> <inter_method> <scale>
#
###################################################################################

import cv2
import sys

input_path = sys.argv[1]
output_path = sys.argv[2]
inter_method = sys.argv[3]
scale = sys.argv[4]

if len(scale.split("/")) > 1:
    a , b = scale.split("/")
    scale = int(a) / int(b)
else:
    scale = int(scale)

img = cv2.imread(input_path)

if inter_method == "bilinear":
    img_int = cv2.resize(img, (round(img.shape[1] * scale), round(img.shape[0] * scale)), cv2.INTER_LINEAR)
    cv2.imwrite(output_path, img_int)
elif inter_method == "nearest":
    img_int = cv2.resize(img, (round(img.shape[1] * scale), round(img.shape[0] * scale)), cv2.INTER_NEAREST)
    cv2.imwrite(output_path, img_int)
elif inter_method == "bicubic":
    img_int = cv2.resize(img, (round(img.shape[1] * scale), round(img.shape[0] * scale)), cv2.INTER_CUBIC)
    cv2.imwrite(output_path, img_int)
