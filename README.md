# Introduction

In Remote Sensing, much effort has been dedicated to the Super-Resolution field to overcome physical sensors limitations, and Deep Learning has vastly surpassed Interpolation and Reconstruction based methods. Spatial and Multi-Spectral based methods are commonly pre-dominant in the field, and, motivated by the recent success stories of 3D spatial modeling with Implicit Neural Representation, new continuous image modeling methods are appearing. In this present work, we take advantage of already existing Spatial and Spectral techniques and Learning Continuous Image Representation with Local Implicit Image Function (LIIF) by adding the Temporal dimension into the problem, leaning towards a continuous interpolation model of space and time as a first approximation to the total modelization.

<img src="https://user-images.githubusercontent.com/57730982/223851674-17124b5f-bafa-4a7c-84e2-2a42a2dc6420.png" width="520">

## Open Earth Observation Hub (Web Service)

The Open Earth Observation Hub is a web solution that simplifies access to data from multiple API providers. This interactive front-end browser centralizes data access and make it accessible to a wide range of users and protect sensitive data.

![Screenshot of the app](https://github.com/ggcr/open-EO-hub/blob/main/public/showcase_img.png)

### What is it?

This is a multi-source API client for open-access and free Earth Observational Data. As time goes on we will add new features as well as new providers according to our needs. It is implemented with React. We do the user authentication behind the scenes for you so that the download of data is 1 click away from your browser!

### Multiple Data Providers

At the moment we are getting data from Element 84 open STAC API in which we can access Sentinel S2A Cloud Optimized. And the brand new Copernicus Data Space Ecosystem API from the European Space Agency (ESA) in which we can access Sentinel 1, Sentinel 2, Sentinel 3, Sentinel 5P, Landsat 5, Landsat 7 and Landsat 8 data.

![](https://i.gyazo.com/0bcad2537c3e0321d53835fe8ce11df6.png)

### Capabilities

* Interactive map of the whole world.

* Search multiple providers and all their offered products:
    * Element84 STAC API
        - Sentinel SL2 Cloud Optimized
    * Copernicus Data Space Ecosystem
        - Sentinel 1
        - Sentinel 2
        - Sentinel 3
        - Sentinel SP
        - Landsat 7
        - Landsat 8
    * Microsoft Planetary API
        - Copernicus DEM Glo-30
        - Copernicus DEM Glo-90

* Filter by position (Latitude, Longitude) interactively with the Leaflet Map.

* Filter by Date of Acquisition, by Start-date, End-date or both.

* Pagination support for all the results.

* Display General Info of the Constellation, the Mission, Date of Acquisition and pre-processing percentages of the contents of each result.

* Download any band, metadata or thumbnail asynchronously at any time.

## Cross-platform Processing Application

A cross-platform application made for our own data processing. It is implemented with ElectronJS and it relies heavily with GDAL. This was built as a native application for the easy access to big local files.

![Captura de pantalla 2023-03-06 a las 10 43 34](https://user-images.githubusercontent.com/57730982/223074096-e2bced10-127a-4aa1-921e-3a131519bfa8.png)

### Capabilities

* Interactive map of the whole world.

* Drag and Drop your Sentinel samples and with the help of the Metadata it will be positioned in screen. Making the necesary conversion of coordinate system.

* Square Selection and Crop for any number of samples asynchronously.

[![Image from Gyazo](https://i.gyazo.com/d58733d31bf909d74c8459c20d112ee2.jpg)](https://gyazo.com/d58733d31bf909d74c8459c20d112ee2)

* Shapefile support for displaying the selected region and cropping.

[![Image from Gyazo](https://i.gyazo.com/abf5a48f5354d315f797c6fe6230b5ff.png)](https://gyazo.com/abf5a48f5354d315f797c6fe6230b5ff)

* Multiple providers for the Map (OSM, OpenTopography, ESRI Satellite).

* Added support for Linear Interpolation, Nearest-Neighbour Interpolation, Bicubic Interpolation...
* Create GIFs for multiple Interpolations.

<p align="center">
<img width="4776" alt="Group 12" src="https://user-images.githubusercontent.com/57730982/226204754-016d026e-0041-41b3-bf29-41a1875b53f4.png">
</p>

<p align="center">
<img width="576" alt="Group 12" src="https://user-images.githubusercontent.com/57730982/226205234-2c7c7257-7f06-4677-a06c-e381e591cf18.gif">
</p>

* Functions to select any region by specifying a Bound of Coordinates:

![Captura de pantalla 2023-04-06 a las 13 25 51](https://user-images.githubusercontent.com/57730982/230363458-57585250-6700-4ab6-a062-5d4fd1d31aef.png)

* Save any generated files into your local disk.

## Temporal LIIF



### Other: Utils

- Deployed `utils` folder which contains new updated scripts, re-wroted:
  - `utils/data-adaptation.py` Pre-process and data adaptation of histogram matching, made a mechanism to do all the adaptation and let the user choose the best with labels.
    ![Captura de pantalla 2023-06-10 a las 16 38 03](https://github.com/ggcr/TFG-CristianGutierrez/assets/57730982/f185e8ff-9246-4d67-8e5b-20e3875ea061)
  - `utils/temporal-5-subset.py` The temporal checking (Equation 5 TFG document), for all the images. It is really fast.
  - `utils/interpolation.py` Previous Bilinear interpolation (PIL, skimage...)
  - `utils/bicubic-torch.py` Bicubic interpolation made with Torchvision and PIl. Much much easier, fast, and better.
  - `utils/average.py`
  - `utils/temporal-difference.py` This script will calculate the difference between the Interpolation t value and the Ground Truth t value, we obtain an average of 2.9 days of difference, but we have an outlier.
  - `utils/results_crop.py` Script that will crop a small region of the image and calculate the PSNR for all the models in the project. This will be used to generate a figure for some interesting visual results.

### results



![result_models](https://github.com/ggcr/TFG-CristianGutierrez/assets/57730982/3b2e430f-1f40-4f05-8572-131e62ffa474)
