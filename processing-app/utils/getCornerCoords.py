from osgeo import gdal,ogr,osr
import sys

ds = gdal.Open(str(sys.argv[1]))
print(sys.argv)
ulx, xres, xskew, uly, yskew, yres  = ds.GetGeoTransform()
lrx = ulx + (ds.RasterXSize * xres)
lry = uly + (ds.RasterYSize * yres)
corners = ([[min(uly, lry), min(ulx, lrx)], [min(uly, lry), max(ulx, lrx)], [max(uly, lry), min(ulx, lrx)], [max(uly, lry), max(ulx, lrx)]])
for corner in corners:
    print("Corner: ", corner)