import psycopg2, glob, os, shutil, hashlib, datetime, sys, time
from datetime import datetime, date, timedelta
from sqlalchemy import create_engine


def importWithStoredProcs(**kwargs):
    clientID = kwargs.get("client_id")
    deleteZipFiles(clientID)
    moveFilesToImport(clientID)
    runStoredProcs(clientID)


def deleteZipFiles(clientID):
    delFiles = glob.glob(
        f"c:/convert/{clientID}/*.zip"
    )  # Move files to mfa_import directory and delete unwanted files
    if delFiles:
        for zip in delFiles:
            os.remove(zip)


def moveFilesToImport(clientID):
    os.chdir(f"c:/convert/{clientID}/")
    moveFiles = glob.glob("*.csv")
    if moveFiles:
        for csvfiles in moveFiles:
            shutil.move(
                f"c:/convert/{clientID}/{csvfiles}",
                f"c:/mfa_imports/{clientID}/{csvfiles}",
            )


def runStoredProcs(clientID):
    connCrunch = psycopg2.connect(
        database="mfa_crunch",
        user="postgres",
        password="masterkey",
        host="localhost",
        port="5432",
    )
    connClient = psycopg2.connect(
        database=clientID,
        user="postgres",
        password="masterkey",
        host="localhost",
        port="5432",
    )
    os.chdir(f"c:/mfa_imports/{clientID}/")
    importFiles = glob.glob("*.csv")
    if importFiles:
        for files in importFiles:
            if files == "mfa_trip.csv" or files == "mfa_events.csv":
                # Generate  md5 hash string
                md5_hash = hashlib.md5()
                with open((files), "rb") as f:
                    for chunk in iter(lambda: f.read(4096), b""):
                        md5_hash.update(chunk)
                hash5Str = md5_hash.hexdigest().upper()
                # Check to see if file hasn't already been processed
                cur = connCrunch.cursor()
                cur.execute(
                    "delete from mfaglb.processed_files where md5_checksum = '"
                    + hash5Str
                    + "'"
                )

                cur.execute(
                    "select md5_checksum from mfaglb.processed_files where md5_checksum = '"
                    + hash5Str
                    + "'"
                )
                md5_checksum = cur.fetchall()
                print("md5_checksum =", md5_checksum)
                cur.close()
                if not md5_checksum:
                    print("WRITING TO DB", datetime.now())
                    # Call crunch_import stored proc
                    cur = connCrunch.cursor()
                    cur.callproc(
                        "mfaglb.crunch_import",
                        [
                            "{"
                            + '"_client_id"'
                            + ":"
                            + '"'
                            + clientID.upper()
                            + '"'
                            + "}",
                        ],
                    )
                    cur.close()
                    connCrunch.commit()
                    # Call push_import stored proc
                    cur = connClient.cursor()
                    cur.callproc(
                        "fleet.push_import",
                        [
                            "{"
                            + '"_client_id"'
                            + ":"
                            + '"'
                            + clientID.upper()
                            + '"'
                            + "}",
                        ],
                    )
                    cur.close()
                    connClient.commit()
                    # Call update_last_push stored proc
                    cur = connCrunch.cursor()
                    cur.callproc(
                        "mfaglb.update_last_push",
                        [
                            "{"
                            + '"_client_id"'
                            + ":"
                            + '"'
                            + clientID.upper()
                            + '"'
                            + "}",
                        ],
                    )
                    cur.close()
                    connCrunch.commit()
                    # Call add_processed_file stored proc
                    cur = connCrunch.cursor()
                    cur.callproc(
                        "mfaglb.add_processed_file",
                        [
                            clientID.upper(),
                            files,
                            hash5Str,
                        ],
                    )
                    cur.close()
                    connCrunch.commit()
                    # Generate file extension string for processed files
                    dt = datetime.now()
                    dateStr = "_" + dt.strftime("%Y%m%d_%H%M%S%f")[:18]

                    # Check for existence of 'Processed' sub directory and create directory if not present
                    if not os.path.isdir(f"c:/mfa_imports/{clientID}/processed/"):
                        os.mkdir(f"c:/mfa_imports/{clientID}/processed/")
                    # Generate & save processed file
                    src = f"c:/mfa_imports/{clientID}/{files}"
                    dest = f"c:/mfa_imports/{clientID}/processed/{files}"
                    if glob.glob(src):
                        shutil.move(src, dest)
                        os.rename(dest, dest + dateStr)
                else:
                    print("CHECKSUM SAYS DONT WRITE")
                    if glob.glob("mfa_trip.csv"):
                        print("DELETING STUFF")
                        # os.remove('mfa_trip.csv')
                        # os.remove('mfa_events.csv')
                print("Finished with DB")
            else:
                os.remove(f"c:/mfa_imports/{clientID}/{files}")
        os.chdir("\convert")
        connCrunch.close()
        connClient.close()


# Create connection to our db, returns conn object
def connectToMFAdb(clientID):
    conn = psycopg2.connect(
        database=clientID.lower(),
        user="postgres",
        password="masterkey",
        host="localhost",
        port="5432",
    )
    return conn


# create engine for directly writing DF's to a DB
def getDFImportEngine(clientID):
    return create_engine(f"postgresql://postgres:masterkey@localhost:5432/{clientID}")


# if you need to wait for something, use this.  Can take a custom countdown message
def counterDownerThingy(secs, **kwargs):
    if kwargs.get("countdown_msg") is not None:
        countdownmsg = kwargs.get("countdown_msg")
    else:
        countdownmsg = "Waiting for things to happen"
    for remaining in range(secs, 0, -1):
        sys.stdout.write("\r")
        sys.stdout.write(f"{countdownmsg}...: {remaining:2d}s")
        sys.stdout.flush()
        time.sleep(1)
    sys.stdout.write("\r")
