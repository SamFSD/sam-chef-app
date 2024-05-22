import sys, datetime, psycopg2
import logging, glob, os, traceback
import pandas as pd
from dotenv import load_dotenv
import pre_processing_sql
import trip_data_import
from .db_con import connect_to_db
import MFAmail

load_dotenv()

logFile = os.environ.get('logFile')
print('!!!!', logFile)
logging.basicConfig( 
format='%(asctime)s >>>> %(levelname)s - %(message)s', level=logging.INFO,
handlers = [logging.FileHandler(logFile),logging.StreamHandler()])
logging.info('Starting importer....')
conn = connect_to_db()
cur = conn.cursor()

mail_addresses = ['erlo.conradie@macrocomm.co.za']

csv_save_path = os.environ.get('fuel_csv_saved_path')
csv_store_path = os.environ.get('fuel_csv_store_path')
fuel_csv_processed_path = os.environ.get('fuel_csv_processed_path')
automated_download_location = os.environ.get('automated_download_location')


def import_maintenance():
    try:
        latest_maint_file = max(glob.glob(automated_download_location + "Wesbank_Maintenance*.csv"), key=os.path.getctime)
    except:
        return
    if not latest_maint_file: #if no maint txn file found, continue
        return
    logging.info(f"""Importing maintenance txns:{latest_maint_file}...""")
    print("maint", latest_maint_file)
    raw_df = pd.read_csv(latest_maint_file, delimiter='|', encoding='latin1')


    ############################## TEMPORARY FIX FOR NEW FORMAT #########################################
    # set recharge_indicator to false.  Last batch had no column for this
    raw_df['RECHARGE_INDICATOR'] = False
    # print(raw_df)
    # quit()
    # remove cancelled txns
    approved_txns = raw_df[raw_df.WORKORDERSTATUS != 'Canceled']
    #replace all blank string and nan values with 'not_invoiced
    approved_txns['INVOICENUMBER'] = approved_txns['INVOICENUMBER'].fillna('not_invoiced')
    # print(approved_txns)
    # quit()
    cancelled_txns = raw_df[raw_df.WORKORDERSTATUS == 'Canceled']
    # print(cancelled_txns)
    # quit()
    ####if format has changed, check 'maint_txn_importer_from_tertius.py', there might be prewritten code there for different formats #############
    # for df in [approved_txns, cancelled_txns]:
    approved_txns['Mapping'] = 'Unknown'
    approved_txns['Branch'] = 'Unknown'
    approved_txns['VEHICLEDESCRIPTION'] = 'Unknown'
    approved_txns['Division'] = 'Unknown'
    approved_txns['ContractType'] = 'Unknown'
    approved_txns['julian_month'] = '2022-12-01'
    approved_txns['PARTPRICE']=0
    approved_txns['PARTCOST']=0
    approved_txns['LABOURRATE']=0
    approved_txns['invoice_status']= None
    approved_txns[['SAVINGS', 'QUANTITY']] = approved_txns[['SAVINGS', 'QUANTITY']].astype(float)
    approved_txns['fleet_no'] = 'None'
    
    ###bypassed as this is not in the maint file from 7 sept onwards
    # approved_txns['SHORTDESCRIPTION'] = 'None'

    # approved_txns['SAVINGS'] = 0
    approved_txns['SUPPLIERNAME'] = approved_txns['SUPPLIERNAME'].apply(lambda x: str(x).replace("'", ''))
    approved_txns[['PARTPRICE', 'PARTCOST', 'LABOURRATE', 'SAVINGS', 'SAVINGSREASON', 'QUANTITY']] = approved_txns[['PARTPRICE', 'PARTCOST', 'LABOURRATE', 'SAVINGS', 'SAVINGSREASON', 'QUANTITY']].fillna(0)
    approved_txns = approved_txns[['LICENSEPLATE', 'Branch', 'NATURE', 
    'MAKE', 'MODEL', 'VEHICLEDESCRIPTION', 'PRODUCTCATEGORY', 
    'QUOTATIONTEMPLATE',
            'Mapping', 'SHORTDESCRIPTION', 'ORDERDATE', 'SUPPLIERNAME', 'CHARGEONAMOUNT',
             'COMPCATAGORY', 'WORKORDERDISTANCE', 'PARTPRICE', 'PARTCOST', 'LABOURRATE', 'SAVINGSREASON',
             'SAVINGS',  'QUANTITY', 
            'WORKORDER_ID', 'CUSTOMERPO', 'INVOICENUMBER', 'Division', 'ContractType', 'julian_month', 'RECHARGE_INDICATOR', 'invoice_status', 'fleet_no']]	
    approved_txns['SHORTDESCRIPTION'] = approved_txns['SHORTDESCRIPTION'].astype(str).str.replace(
        '   ', ' - ')
    approved_txns['SHORTDESCRIPTION'] = approved_txns['SHORTDESCRIPTION'].apply(lambda x: str(x).replace("NULL", ''))
    approved_txns['SHORTDESCRIPTION'] = approved_txns['SHORTDESCRIPTION'].str.replace(' / ', ' - ')
    approved_txns = approved_txns.fillna(0)
    approved_txns.drop(approved_txns[approved_txns['ORDERDATE'] == ''].index, inplace = True)
    approved_txns.drop(approved_txns[approved_txns['ORDERDATE'] == 0].index, inplace = True)
    cancelled_txns['Mapping'] = 'Unknown'
    cancelled_txns['Branch'] = 'Unknown'
    cancelled_txns['VEHICLEDESCRIPTION'] = 'Unknown'
    cancelled_txns['Division'] = 'Unknown'
    cancelled_txns['ContractType'] = 'Unknown'
    cancelled_txns['julian_month'] = '2022-12-01'
    cancelled_txns['PARTPRICE']=0
    cancelled_txns['PARTCOST']=0
    cancelled_txns['LABOURRATE']=0
    cancelled_txns['invoice_status']= None
    cancelled_txns[['SAVINGS', 'QUANTITY']] = cancelled_txns[['SAVINGS', 'QUANTITY']].astype(float)
    cancelled_txns['fleet_no'] = 'None'
    # cancelled_txns['SAVINGS'] = 0
    cancelled_txns['SUPPLIERNAME'] = cancelled_txns['SUPPLIERNAME'].apply(lambda x: str(x).replace("'", ''))
    cancelled_txns[['PARTPRICE', 'PARTCOST', 'LABOURRATE', 'SAVINGS', 'SAVINGSREASON', 'QUANTITY']] = cancelled_txns[['PARTPRICE', 'PARTCOST', 'LABOURRATE', 'SAVINGS', 'SAVINGSREASON', 'QUANTITY']].fillna(0)
    cancelled_txns = cancelled_txns[['LICENSEPLATE', 'Branch', 'NATURE', 'MAKE', 'MODEL', 'VEHICLEDESCRIPTION', 'PRODUCTCATEGORY', 'QUOTATIONTEMPLATE',
            'Mapping', 'SHORTDESCRIPTION', 'ORDERDATE', 'SUPPLIERNAME', 'CHARGEONAMOUNT', 'COMPCATAGORY', 'WORKORDERDISTANCE', 'PARTPRICE', 'PARTCOST', 'LABOURRATE',  'SAVINGSREASON', 'SAVINGS','QUANTITY', 
            'WORKORDER_ID', 'CUSTOMERPO', 'INVOICENUMBER', 'Division', 'ContractType', 'julian_month', 'RECHARGE_INDICATOR','invoice_status', 'fleet_no']]
    cancelled_txns['SHORTDESCRIPTION'] = cancelled_txns['SHORTDESCRIPTION'].astype(str).str.replace(
        '   ', ' - ')
    cancelled_txns['SHORTDESCRIPTION'] = cancelled_txns['SHORTDESCRIPTION'].apply(lambda x: str(x).replace("NULL", ''))
    cancelled_txns['SHORTDESCRIPTION'] = cancelled_txns['SHORTDESCRIPTION'].str.replace(' / ', ' - ')
    cancelled_txns = cancelled_txns.fillna(0)
    cancelled_txns.drop(cancelled_txns[cancelled_txns['ORDERDATE'] == ''].index, inplace = True)
    cancelled_txns.drop(cancelled_txns[cancelled_txns['ORDERDATE'] == 0].index, inplace = True)
       
    new_csv_name = "/tmp//import_csv.csv"
    new_cancelled_csv_name = "/tmp//cancelled_import_csv.csv"
    approved_txns.to_csv(new_csv_name, index=False, header=True) 
    # print(approved_txns)   
    cancelled_txns.to_csv(new_cancelled_csv_name, index=False, header=True)    
    # quit()
    ### clear all current txns ###
    cur.execute("""delete from temp.maintenance_temp""")
    cur.execute("""delete from temp.maintenance_cancelled_temp""")
    for file in [{'file': new_csv_name, 'table': 'maintenance_temp'}, {'file': new_cancelled_csv_name, 'table': 'maintenance_cancelled_temp'}]:
        tempTableQuery = f"""
                        COPY temp.{file['table']} FROM '{file['file']}' CSV HEADER;
                        """
        print(tempTableQuery)
        cur.execute(tempTableQuery)
        conn.commit()

    with open('sql/maintenance_pre_pro_and_insert.sql') as pp:
        cur.execute(pp.read())
        conn.commit()
    quit()
    #### update mapping on transactions #####
     ###### get all unmapped txns, send it in an email ######
    csv_file_name = "C://Users//Administrator//Desktop//import_reports//Transactions_Updated_" + os.path.splitext(os.path.basename(latest_maint_file))[0] + '.xlsx'
    writer = pd.ExcelWriter(csv_file_name, engine='xlsxwriter')
    
    unmapped_transactions = pd.read_sql("""select distinct(maintenance.veh_type_map || maintenance.maintdescription || maintenance.component_cat) as required_map, 
        maintenance.veh_type_map, maintenance.maintdescription, maintenance.component_cat
        from fleet.maintenance where mapping = 'Unknown'""", con=conn)
    unmapped_transactions.to_excel(writer, sheet_name='Unmapped Txns', index=False)
    writer.save()
    writer.close()
    mail_body = f"""New Transaction File Imported: {os.path.basename(latest_maint_file)}\n\n
    Unmapped Transactions: {len(unmapped_transactions)}\n\nPlease see attached file for more information"""
    MFAmail.sendReportMail(recipients=mail_addresses, mail_subject='Transactions Imported - SHO001', file_name=csv_file_name, mail_body=mail_body)
    os.rename(latest_maint_file, "C://Users//Administrator//Desktop//winscp_auto_downloads//Processed//" + os.path.splitext(os.path.basename(latest_maint_file))[0] + ".csv")

    logging.info('Maintenance Transactions Imported')
