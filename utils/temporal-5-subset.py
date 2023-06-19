import sys
import os
import json
import time
import datetime
from datetime import datetime, timedelta
from itertools import combinations
import sys
import math
import copy
import skimage
import numpy as np
from PIL import Image

# Equación 5 TFG
def sq(t, highres):
    t.sort()
    inter = (min(t) +
    ((math.pow(t[0]-t[1], 2)**(1./2.))/2) +
    ((math.pow(t[1]-t[2], 2)**(1./2.))/2) +
    ((math.pow(t[2]-t[3], 2)**(1./2.))/2) +
    ((math.pow(t[3]-t[4], 2)**(1./2.))/2) )
    return inter, abs(highres - inter)

if __name__ == '__main__':
    root_path = "../data/"
    metadata_dict = {}
    for dp, dn, filenames in os.walk(root_path):
        for f in filenames:
            if f.endswith('.metadata'):
                k = '-'.join(f.split('.')[0].split('-')[:-1]).replace(" ", "_")
                n = f.split('.')[0].split('-')[-1]
                metadata_dict[k] = metadata_dict.get(k, {})
                metadata_dict[k][n] = os.path.join(dp, f)

    res = {}
    for k,v in metadata_dict.items():
        res[k] = {}
        for j,v2 in v.items():
            f = open(v2)
            data = json.load(f)
            try:
                res[k]['highres_date'] = data['highres_date']
                res[k][int(j)] = data['lowres_date']
            except:
                try:
                    res[k]['highres_date'] = data['target_date']
                    res[k][int(j)] = data['datetime']
                except:
                    print(data)

    final = {}

    for k,v in res.items():
        highres_date = v['highres_date']
        highres = int(time.mktime((datetime.strptime(highres_date, "%Y-%m-%d") + timedelta(days=1)).timetuple()))

        highres_back = datetime.utcfromtimestamp(highres).strftime("%Y-%m-%d")

        LR_dates = []

        for j,v2 in v.items():
            if j != 'highres_date':
                lr_time = int(time.mktime((datetime.strptime(v2, "%Y-%m-%d") + timedelta(days=1)).timetuple()))
                LR_dates.append(lr_time)

        # Para todas las posibles combinaciones de 5 LRs...
        it = combinations(LR_dates, 5)
        minim = sys.maxsize
        for i in combinations(LR_dates, 5):
            dates = list(i)
            dates.sort()
            inter, dif = sq(dates, highres)
            if dif < minim:
                final[k] = {}
                final[k]['dates'] = dates
                final[k]['diff'] = dif
                final[k]['highres'] = datetime.utcfromtimestamp(highres).strftime("%Y-%m-%d")
                final[k]['inter'] = datetime.utcfromtimestamp(inter).strftime("%Y-%m-%d")
                minim = dif

    for k,v in final.items():
        for j,v2 in v.items():
            if j == 'dates':
                date_list = []
                for i in v2:
                    date_list.append(datetime.utcfromtimestamp(i).strftime("%Y-%m-%d"))
                final[k][j] = date_list

    lrs_root_path = "../data/lr_dataset/"
    outpath = "../temporal_dataset/"
    if not os.path.exists(outpath):
        os.makedirs(outpath)

    dirs = sorted(os.listdir(lrs_root_path))

    for dirname in dirs:
        if dirname.startswith('.DS_Store'):
            continue
        if not os.path.exists(os.path.join(outpath, dirname)):
            os.makedirs(os.path.join(outpath, dirname))
        f = final[dirname]
        res_ = copy.deepcopy(res)
        del res_[dirname]['highres_date']
        print(dirname)
        print("Highres: {}, Diff: {}, Inter {}".format(f['highres'], f['diff'], f['inter']))

        keysarr= []
        for d in f['dates']:
            k = list(res_[dirname].keys())[list(res_[dirname].values()).index(d)]
            keysarr.append(k)
            print("\tdate {} \t idx {}".format(d, k))
        print("{} & {} & {} \n".format(', '.join(map(str,keysarr)), f['inter'], f['highres']))

        lrs = []
        for i in range(1, 17):
            lr_path = os.path.join(lrs_root_path, dirname, "L2A", "{}-{}-L2A_data_adapted.png".format(dirname, i))
            if not os.path.exists(lr_path):
                break
            lr = skimage.io.imread(lr_path)
            lrs.append(np.array(lr))

        cnt = 1
        for k in keysarr:
            pil_lr = Image.fromarray(lrs[k-1])
            pil_lr.save(os.path.join(outpath, dirname, "{}.png".format(cnt)))
            cnt += 1