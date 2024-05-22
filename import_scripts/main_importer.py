import logging, glob
import sys
import traceback
from MFAmail import getDCIMail, sendErrorMail


from individual_imports.trip_data_import import import_trip_data_files,delete_processed_trip_data_files
from individual_imports.events_import import delete_processed_event_data_file, import_events_data_files
from ftp_file_grabber import retrieve_sftp_files
from import_scripts.maintenance_importer import import_maintenance
import os

logFile = "//tmp//Wesbank_Imports//import_log//Shoprite_Importer_Log.txt"
downloaded_files = glob.glob('//tmp//Wesbank_Imports//*.*')

logging.basicConfig(
    filename=logFile,
    filemode="a",
    format="%(asctime)s >>>> %(levelname)s - %(message)s",
    level=logging.INFO,
)

def delete_downloaded_files():
     for file in downloaded_files:
          
          try:
               os.remove(file)
          except:
               print(file)
               continue

def get_events_and_trip_data():
    getDCIMail(client_id = 'sho001')


#### retrieve sftp files (maintenance and fleetlists) from Wesbank
# try:
#      retrieve_sftp_files()
# except Exception as E:
#      logging.exception("Exception Occurred")
#      sendErrorMail(
#           client_id='sho001',
#           script_name=sys.argv[0],
#           log_file=logFile,
#           error_traceback=traceback.format_exc(),
#      )
#      print(traceback.format_exc())
#      quit()


# try:
# ### Download Events and Trip Data from MailBox
#      get_events_and_trip_data()

#      ### import trip data files if fails send mail and quit if successful remove all imported files
#      try:
#           import_trip_data_files()
#      except Exception as E:
#           logging.exception("Exception Occurred")
#           sendErrorMail(
#           client_id='sho001',
#           script_name=sys.argv[0],
#           log_file=logFile,
#           error_traceback=traceback.format_exc(),
#      )
#           print(traceback.format_exc())
#           quit()
#      else:
#           delete_processed_trip_data_files()


#      ### import events data files if fails send mail and quit if successful remove all imported files
#      try:
#           import_events_data_files()
#      except Exception as E:
#           logging.exception("Exception Occurred")
#           sendErrorMail(
#           client_id='sho001',
#           script_name=sys.argv[0],
#           log_file=logFile,
#           error_traceback=traceback.format_exc(),
#      )
#           print(traceback.format_exc())

#           quit()
#      else:
#           delete_processed_event_data_file()
# except:
#      logging.exception("Exception Occurred")
#      sendErrorMail(
#           client_id='sho001',
#           script_name=sys.argv[0],
#           log_file=logFile,
#           error_traceback=traceback.format_exc(),
#      )
#      print(traceback.format_exc())
#      quit()
# else:
#      ### delete the temp files after a successful import
#      delete_downloaded_files()


if __name__ == "__main__":

    try:

        # retrieve sftp files
        retrieve_sftp_files()
        # import maintenance files to temp table, preprocess, and insert into prod table
        import_maintenance()
        # Download Events and Trip Data from MailBox
        get_events_and_trip_data()
        # import trip data files if fails send mail and quit if successful remove all imported files
        import_trip_data_files()
        delete_processed_trip_data_files()
        # import events data files if fails send mail and quit if successful remove all imported files
        import_events_data_files()
        delete_processed_event_data_file()

    except Exception as E:
        logging.exception("Exception Occurred")
        sendErrorMail(
            client_id="sho001",
            script_name=sys.argv[0],
            log_file=logFile,
            error_traceback=traceback.format_exc(),
        )
        print(traceback.format_exc())
        quit()

    else:
        ### delete the temp files after a successful import
        delete_downloaded_files()
