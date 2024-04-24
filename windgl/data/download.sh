#!/bin/bash

GFS_DATE=${1}
GFS_TIME="18"; # 00, 06, 12, 18
RES="1p00" # 0p25, 0p50 or 1p00
BBOX="leftlon=0&rightlon=360&toplat=90&bottomlat=-90"
#BBOX="leftlon=120&rightlon=150&toplat=50&bottomlat=25"
LEVEL="lev_100_m_above_ground=on"
#GFS_URL="http://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_${RES}.pl?file=gfs.t${GFS_TIME}z.pgrb2.${RES}.f000&${LEVEL}&${BBOX}&dir=%2Fgfs.${GFS_DATE}${GFS_TIME}"
# GFS_URL="https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_1p00.pl?dir=%2Fgfs.20240229%2F18%2Fatmos&file=gfs.t18z.pgrb2.1p00.anl&var_VGRD=on&lev_100_m_above_ground=on&subregion=&toplat=90&leftlon=0&rightlon=360&bottomlat=-90"

# curl "${GFS_URL}&var_UGRD=on" -o utmp.grib
# curl "${GFS_URL}&var_VGRD=on" -o vtmp.grib
for i in "00" "06" "12" "18"
do
    echo "Downloading: $GFS_DATE$i"
    curl "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_${RES}.pl?dir=%2Fgfs.${GFS_DATE}%2F${i}%2Fatmos&file=gfs.t${i}z.pgrb2.${RES}.anl&var_UGRD=on&${LEVEL}&subregion=&${BBOX}" -o in_utmp.grib
    curl "https://nomads.ncep.noaa.gov/cgi-bin/filter_gfs_${RES}.pl?dir=%2Fgfs.${GFS_DATE}%2F${i}%2Fatmos&file=gfs.t${i}z.pgrb2.${RES}.anl&var_VGRD=on&${LEVEL}&subregion=&${BBOX}" -o in_vtmp.grib
    
    grib_set -r -s packingType=grid_simple in_utmp.grib utmp.grib
    grib_set -r -s packingType=grid_simple in_vtmp.grib vtmp.grib

    rm in_utmp.grib in_vtmp.grib
    printf "{\"u\":`grib_dump -j utmp.grib`,\"v\":`grib_dump -j vtmp.grib`}" > tmp.json

    rm utmp.grib vtmp.grib

    DIR=`dirname $0`
    node ${DIR}/prepare.js /home/gfs/demo/wind/${GFS_DATE}${i}

    rm tmp.json
    echo "End: $GFS_DATE$i"
    echo ""
done
    echo "===DONE==="



