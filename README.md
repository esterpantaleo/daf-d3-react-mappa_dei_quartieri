A [d3.js](https://d3js.org) dashboard using React built with [Create React App](https://github.com/facebookincubator/create-react-app) visualizing statistical data from ISTAT (year 2011) (not yet actually, right now it uses random data) on the map of neighborhoods (NIL) in Milan, Italy.

# Use
`npm i` and `npm start` and you should see a dashboard at `localhost:3000`

# Input data
Data downloaded from http://www.istat.it/storage/cartografia/variabili-censuarie/dati-cpa_2011.zip, subfolder "Sezioni di censimento" (documentation available at documented at https://www.istat.it/it/files/2013/11/Descrizione-dati-Pubblicazione-2016.03.09.pdf) extracted with code:

    cd dati-cpa_2011/Sezioni\ di\ Censimento/
    output=../istat_2011_Milano.csv
    head -1 R01_indicatori_2011_sezioni.csv | awk 'BEGIN{FS=";"} BEGIN{OFS=";"}{print $6,$8,$13,$73,$138,$139,$140,$141}' >> ${output}
    for i in *; do echo "processing file "$i; cat ${i} | tail -n +2 | awk 'BEGIN{FS=";"} BEGIN{OFS=";"}{print $6,$8,$13,$73,$138,$139,$140,$141}' | grep Milano >> ${output}; done 


    
Headers correspond to:
#P1: number of residents
#P61: number of employed people
#E17: number of residential buildings with one floor
#E18: number of residential buildings with 2 floors
#E19: number of residential buildings with 3 floors
#E20: number of residential buildings with 4 floors or more
#SEZ2001: identifier for "sezione di censimento"
#COMUNE
#AreaMQ: area of a NIL in square meters


