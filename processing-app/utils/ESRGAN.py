import torch
from PIL import Image
import numpy as np
from RealESRGAN import RealESRGAN
import sys
import os
from os.path import dirname, abspath

# pip install git+https://github.com/sberbank-ai/Real-ESRGAN.git

d = dirname(dirname(abspath(__file__)))
w = 'weights/RealESRGAN_x4.pth'
weights_local = d + '/' + w

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
model = RealESRGAN(device, scale=4)

if os.path.exists(weights_local):
    model.load_weights(weights_local)
else:
    model.load_weights(weights_local, download=True)

path_to_image = sys.argv[1]
image = Image.open(path_to_image).convert('RGB')

sr_image = model.predict(image)

sr_image.save(sys.argv[2])
