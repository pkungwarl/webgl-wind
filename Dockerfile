FROM ubuntu/grib2

RUN mkdir -m 777 /home/gfs
ADD windgl/ /home/gfs/
WORKDIR /home/gfs/windgl
	
RUN npm install

EXPOSE 1337

CMD [ "npm", "start"] 