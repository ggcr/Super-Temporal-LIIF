###########################################################################################
#
# This is the script that does N-dimensional interpolation, the script should be used as
# follows: python interpn.py <lenPix> <input> <spatial> <temporal> <spectral>
#
# Cristian Gutiérrez -- Computer Vision Center (CVC)
#
###########################################################################################

import sys
import os
import numpy as np
from PIL import Image
from matplotlib import pyplot as plt
from scipy.interpolate import interpn
import random

def change_name(path, temporal):
    # Para cada input debemos generar N temporales
    out = []
    path, filename = os.path.split(path)
    filename = os.path.splitext(filename)[0]
    newfilename = 'INTER_%s_temp_%d.png' % (filename, 0)
    newpath = os.path.join(path, newfilename)
    out.append(newpath)
    for i in range(temporal):
        newfilename = 'INTER_%s_temp_%d.png' % (filename, i+1)
        newpath = os.path.join(path, newfilename)
        out.append(newpath)
    return out

# Parameters
lenPix = int(sys.argv[1])
pix = []
pathpix = []
for i in range(0, lenPix):
    path = sys.argv[i+2]
    pathpix.append(path)
    image = np.array(Image.open(path))
    # print(image.shape)
    pix.append(image)
    # print("image " + str(i) + " " + path)

pix = np.array(pix)

spatial = int(sys.argv[lenPix+2])
# print("spatial: ", spatial)
temporal = int(sys.argv[lenPix+3])
# print("temporal: ", temporal)
spectral = int(sys.argv[lenPix+4])
# print("spectral: ", spectral)

outpaths = []
for i in range(len(pathpix) - 1):
    # print("PATHPIX: ", pathpix[i])
    outpaths.extend(change_name(pathpix[i], temporal))
# outpaths.append(pathpix[-1])
outpaths.extend(change_name(pathpix[-1], 0))

# print(pix.shape)

# Concatenate images
firstIm = pix[0,:,:,:]
v = np.empty((firstIm.shape[0], firstIm.shape[1], firstIm.shape[2], lenPix))
for i in range(0, lenPix):
    v[:,:,:,i] = pix[i,:,:,:]

# Input Linspace
x = np.linspace(1, v.shape[0], v.shape[0])
y = np.linspace(1, v.shape[1], v.shape[1])
# print("\nESPACIO X\n", x)
# print("\nESPACIO Y\n", y)

z = np.linspace(1, v.shape[2], v.shape[2])
# print("\nESPECTRAL Z\n", z)

w = np.linspace(1, lenPix, lenPix)
# print("\nTEMPORAL W\n", w)

# MeshGrid
# print("\nMESHGRID DE VALORES")
points = (x, y, z, w)
values = v

# print(values.shape) # (width, hight, 3, n)

# Output Linspace
x = np.arange(0.0, v.shape[0]-1, 1/spatial) + 1
y = np.arange(0.0, v.shape[1]-1, 1/spatial) + 1
# print("\nESPACIO X (x2)\n", x)
# print("\nESPACIO Y (x2)\n", y)

z = np.arange(0.0, v.shape[2], 1) + 1
# print("\nESPECTRAL Z\n", z)

ar = np.arange(1,lenPix,1/(temporal+1))
w = np.linspace(1, lenPix, lenPix)
ar = np.append(ar, lenPix)
temp_inter = ar
# temp_inter = np.setdiff1d(ar,ar[0:lenPix*(temporal+1):(temporal+1)])
# print("\nTEMPORAL W (x2)\n", ar)

inter_points = (x, y, z, ar)

# Meshgrid Interpolation
coord = np.array(np.meshgrid(x, y, z, ar, indexing='xy'))   
interp_points = np.moveaxis(coord, 0, -1)                  
result = interpn(points, values, interp_points)

def fd(arr_im):
    img1 = np.rot90(arr_im.astype(np.uint8))
    img1 = np.flip(img1,0)
    return Image.fromarray(img1)

# print("PATHPIX: ", outpaths)

for i in range(result.shape[-1]):
    res = fd(result[:,:,:,i])
    # res.show()
    res.save(outpaths[i])

# This will trigger the ipcMain proc to say that we are done
print("< EOF");
