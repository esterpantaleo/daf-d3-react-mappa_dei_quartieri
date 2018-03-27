    join -a 1 -a 2 -e'-' -1 2 -2 1 -o '0,1.1,1.3,1.4,1.5,1.6,1.7,1.8,2.2' -t ";"  istat_2011_Milano.csv tableNILSezioniDiCensimento2011_sorted_prefixed.csv

    data.csv <- read.csv(file="data.csv",sep=";", header=TRUE)
    tableNILAreaMQ.csv <- read.csv(file="tableNILAreaMQ.csv"),sep=";", header=TRUE)
    data.csv[data.csv=="-"]<-0
    NIL=tableNILAreaMQ.csv[,1]
    results = c();
    for (n in NIL) {
        nildata.csv = data.csv[which(data.csv[,9]==n),c(3,4,5,6,7,8)]
	densitaOccupati = sum(as.numeric(nildata.csv[,2]))/tableNILAreaMQ.csv[which(tableNILAreaMQ.csv[,1]==n),2]
	#sum(E17*1+E18*2+E19*3+E20*4)/sum(E17+E18+E19+E20)
        tipiAlloggio = sum(as.numeric(nildata.csv[,3])+as.numeric(nildata.csv[,4])*2+as.numeric(nildata.csv[,5])*3+ as.numeric(nildata.csv[,6])*4)/sum(as.numeric(nildata.csv[,3])+as.numeric(nildata.csv[,4])+as.numeric(nildata.csv[,5]) + as.numeric(nildata.csv[,6]))
        results = rbind(results,c(n, densitaOccupati, tipiAlloggio))
    }
    write.table(results,"results.csv",row.names=FALSE, sep=";", quote = FALSE)
	
	