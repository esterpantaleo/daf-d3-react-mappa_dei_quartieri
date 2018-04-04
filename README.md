A [d3.js](https://d3js.org) dashboard using React built with [Create React App](https://github.com/facebookincubator/create-react-app) visualizing statistical data from ISTAT (year 2011) on the map of neighborhoods (NIL) in Milan, Italy.

# Use
`npm i` and `npm start` and you should see a dashboard at `localhost:3000`

# Input data
The visualization requires a geojson file (exported into js) of polygons and a json file (turned into js: results.js) with a number of elements equal to the number of polygons and containing data to be associated to each polygon (see for example files [here](src/data/Milano). If "NIL", or "SEZCENS", is the unique identifier of a polygon (a feature in the geojson file), results.js elements must have a property "NIL", or "SEZCENS", containing the identifiers of each polygon. Each other property in the results.js file is a different dataset to be associated to each polygon.

## Json file
To get the results.js file we need Istat data [aggregated on "sezioni di censimento"](src/data/Milano/preprocessing/istat_2011_Milano.csv), a mapping between "sezioni di censimento" and our polygons, and we need to apply some formulas  
### Extracting Istat data
Istat data has been downloaded from ISTAT at this [link](http://www.istat.it/storage/cartografia/variabili-censuarie/dati-cpa_2011.zip), subfolder "Sezioni di censimento" (documentation available [here](https://www.istat.it/it/files/2013/11/Descrizione-dati-Pubblicazione-2016.03.09.pdf). Data for a specific "comune" has been extracted as follows:

    comune="Milano"

    cd dati-cpa_2011/Sezioni\ di\ Censimento/
    output=../istat_2011_${comune}.csv

    #Print header
    head -1 R01_indicatori_2011_sezioni.csv | awk 'BEGIN{FS=";"} BEGIN{OFS=";"}{print $6,$8,$13,$73,$138,$139,$140,$141}' >> ${output}

    #Print data
    for i in *; do echo "processing file "$i; cat ${i} | tail -n +2 | awk 'BEGIN{FS=";"} BEGIN{OFS=";"}{print $6,$8,$13,$73,$138,$139,$140,$141}' | grep ${comune} >> ${output}; done

Headers correspond to:
* P1: number of residents
* P61: number of employed people
* E17: number of residential buildings with one floor
* E18: number of residential buildings with 2 floors
* E19: number of residential buildings with 3 floors
* E20: number of residential buildings with 4 floors or more
* SEZ2001: identifier for "sezione di censimento"
* COMUNE
* AreaMQ: area of a NIL in square meters

### [Mapping "sezioni di censimento" and polygons](src/data/Milano/preprocessing/tableNILSezioniDiCensimento2011_sorted_prefixed.csv)
Istat data is aggregated over sezioni di censimento. We need to aggregate our data over our polygons. 
For this we need a mapping between "sezioni di censimento" and the polygons. The script to obtain the mapping can be found [here](src/data/Milano/preprocessing/getTableNILSezioniDiCensimento2011.html) (it uses the js library turf, i.e., the intersection of centroids of "sezioni di censimemto" and polygons). Given the mapping tableNILSezioniDiCensimento2011_sorted_prefixed.csv we use bash to join:

    join -a 1 -a 2 -e'-' -1 2 -2 1 -o '0,1.1,1.3,1.4,1.5,1.6,1.7,1.8,2.2' -t ";" istat_2011_Milano.csv tableNILSezioniDiCensimento2011_sorted_prefixed.csv

## [Indicators](src/data/Milano/results.js)
Two indicators have been computed:
* tipi di alloggio (tipiAlloggio)
* densità di occupati (densitaOccupati)

From the Istat data and from the area of the polygons, in R:

    data.csv <- read.csv(file="data.csv", sep=";", header=TRUE)
    tableNILAreaMQ.csv <- read.csv(file="tableNILAreaMQ.csv"), sep=";", header=TRUE)
    data.csv[data.csv=="-"] <- 0
    NIL = tableNILAreaMQ.csv[,1]
    results = c();
    for (n in NIL) {
        nildata.csv = data.csv[which(data.csv[,9]==n), c(3,4,5,6,7,8)]
        	
        numOccupati = as.numeric(nildata.csv[,2])
        densitaOccupati = sum(numOccupati)/tableNILAreaMQ.csv[which(tableNILAreaMQ.csv[,1]==n),2]

        #sum(E17*1+E18*2+E19*3+E20*4)/sum(E17+E18+E19+E20)
        numAlloggi1Piano = as.numeric(nildata.csv[,3]
        numAlloggi2Piani = as.numeric(nildata.csv[,4])
        numAlloggi3Piani = as.numeric(nildata.csv[,5])
        numAlloggi4PianiOPiu = as.numeric(nildata.csv[,6])
        numTotAlloggi = sum(numAlloggi1Piano + numAlloggi2Piani + numAlloggi3Piani + numAlloggi4PianiOPiu)
        tipiAlloggio = sum(numAlloggi1Piano + numAlloggi2Piani * 2 + numAlloggi3Piani * 3 + numAlloggi4PianiOPiu * 4) / sum(numTotAlloggi)
        
        results = rbind(results, c(n, densitaOccupati, tipiAlloggio))
    }
    #Write results file
    write.table(results, "results.csv", row.names=FALSE, sep=";", quote=FALSE)
	




