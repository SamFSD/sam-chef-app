import logging, smtplib, os, imaplib, email, ssl, zipfile, glob, shutil, hashlib, psycopg2, datetime, sys, traceback, MFAprocs, re
from datetime import datetime, date, timedelta
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header, decode_header, make_header

################# ERROR REPORT RECIPIENTS #################
# errorMailRecipients = ["dwain.lourens@macrocomm.co.za", "samuel.masubelele@macrocomm.co.za"] ///Testing Sam 
errorMailRecipients = ["erlo.conradie@macrocomm.co.za", "dwain.lourens@macrocomm.co.za", "samuel.masubelele@macrocomm.co.za"]
###########################################################

################# DCI ZONE EMAIL SETTINGS #################
imap_host = "197.242.158.185"
imap_port = 993
###########################################################

################# SENDING BOX SETTINGS ####################
mailSettings = {
    "smtp_server": "smtp.office365.com",
    "port": 587,
    "senderAddress": "noreply@macrocomm.co.za",
    "senderPW": "Qam15507",
}
###########################################################

# sendReportMail can specify:
# Body :  Change default msg body
# Receivers: addresses to send to
# Subject: To change form default subject
# Report file name:  Actual name of file
# Attachment name:  What to name the attachment
def sendReportMail(**kwargs):
    # print(""">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>\nMFAmail Report Mailer Info:\nRequired Args:\n*'file_name': name of report file to be sent\n*'attachment_name': name of file when attached to mail\n*'recipients': Where the mail should be sent in list form\nOptional Args (If not set defaults will be used):\n*'msg_body': Text content of email\n*'mail_subject': Subject of report mail\n>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>""")
    message = MIMEMultipart()
    recieverAdds = kwargs.get("recipients")  # set recipients of mail
    if (
        kwargs.get("mail_body") is not None
    ):  # Set custom Message body if provided in kwargs
        Body = kwargs["mail_body"]
    else:
        Body = "Good day,\n\nPlease find attached your latest Fleet Analytics report. \nThis report was automatically generated and sent from an unattendant mailbox.\
                   \n\nKind regards,\nThe Macrocomm Fleet Analytics Team"
    if (
        kwargs.get("mail_subject") is not None
    ):  # Set custom subject if provided in kwargs
        message["Subject"] = kwargs["mail_subject"]
    else:
        message["Subject"] = "Macrocomm Fleet Analytics Report"
    # attachmentName = kwargs['attachment_name']
    message["From"] = mailSettings["senderAddress"]
    with smtplib.SMTP(mailSettings["smtp_server"], mailSettings["port"]) as server:
        server.ehlo()
        server.starttls()
        server.login(mailSettings["senderAddress"], mailSettings["senderPW"])
        # Add body to email
        message.attach(MIMEText(Body, "plain"))
        # Open file in binary mode, set payload
        for file in [kwargs["file_name"]]:
            with open(file, "rb") as attachment:
                part = MIMEBase("application", "octet-stream")
                part.set_payload(attachment.read())
                # Encode file in ASCII characters to send by email
                encoders.encode_base64(part)
                # Add header as key/value pair to attachment part
                part.add_header(
                    "Content-Disposition",
                    f"attachment; filename={os.path.basename(file)}",
                )
                # Add attachment to message and convert message to string
                message.attach(part)
        text = message.as_string()
        # Log in to server using secure context and send email
        server.sendmail(mailSettings["senderAddress"], recieverAdds, text)
        for x in recieverAdds:
            print("Report Mail Sent >>> '" + kwargs["file_name"] + "' e-mailed to " + x)
            logging.info(f"{kwargs['file_name']} emailed to {x}")


# sendErrorMail can specify:
# Body :  Change default msg body
# Recipients for error mails are set at the top of this file
# sendErrorMail requires client_id, error_traceback, log_file, script_name
def sendErrorMail(**kwargs):
    message = MIMEMultipart()
    traceback = kwargs["error_traceback"]
    clientID = kwargs["client_id"]
    logFile = kwargs["log_file"]
    scriptName = kwargs["script_name"]
    message["Subject"] = f"Error Encountered - {clientID}"
    if (
        kwargs.get("mail_body") is not None
    ):  # Set custom Message body if provided in kwargs
        Body = kwargs["mail_body"]
    else:
        Body = f"An error has occured while running {scriptName}\n\n{traceback}"
    attachmentName = f"{clientID} - {os.path.basename(scriptName)} - log.txt"
    message["From"] = mailSettings["senderAddress"]
    with smtplib.SMTP(mailSettings["smtp_server"], mailSettings["port"]) as server:
        server.ehlo()
        server.starttls()
        server.login(mailSettings["senderAddress"], mailSettings["senderPW"])
        # Add body to email
        message.attach(MIMEText(Body, "plain"))
        # Open file in binary mode, set payload
        with open(logFile, "rb") as attachment:
            part = MIMEBase("application", "octet-stream")
            part.set_payload(attachment.read())
        # Encode file in ASCII characters to send by email
        encoders.encode_base64(part)
        # Add header as key/value pair to attachment part
        part.add_header(
            "Content-Disposition", f"attachment; filename= " + attachmentName
        )
        # Add attachment to message and convert message to string
        message.attach(part)
        text = message.as_string()
        # Log in to server using secure context and send email
        server.sendmail(mailSettings["senderAddress"], errorMailRecipients, text)


# Download emails from dci zone inbox.  Call stored procs for any fnb .txn files.
# Requires client_id arg
def getDCIMail(**kwargs):
    clientID = kwargs["client_id"]
    print(clientID, "Client Id")
    if clientID == 'sho001':
        imap_user = f"{clientID}@macrocomm-fleetanalytics.co.za"
    else:
        imap_user = f"{clientID}@dcizone.com"
    # imap_user = f"{clientID}@dcizone.com"
    # imap_user = f"{clientID}@dcizone.com"
    imap_pass = f"{clientID}12#"
    savePath = f"//tmp//Wesbank_Imports//"
    # movePath = f"/import-scripts/temp_csv_files"
    imap = imaplib.IMAP4_SSL(imap_host)
    ## login to server
    imap.login(imap_user, imap_pass)
    imap.select("Inbox")
    typ, data = imap.search(None, "unseen")  # search for unread emails
    print(data)
    # if str(data[0]) == "b''":  # if no new mails in inbox
    #     sendNoMailNotif(clientID)
    for num in data[0].split():
        typ, data = imap.fetch(num, "(RFC822)")  # save attachments to file path
        raw_email = data[0][1]
        raw_email_string = raw_email.decode("utf-8")
        email_message = email.message_from_string(raw_email_string)
        for part in email_message.walk():
            if part.get_content_maintype() == "multipart":
                continue
            if part.get("Content-Disposition") is None:
                continue
            fileName = part.get_filename()
            fileDate = email_message["date"]
            fileDate = fileDate[5:25]

            if fileName[:7] == "=?UTF-8" or "=?utf-8":
                decodeFileName = make_header(decode_header(fileName))
                fileName = str(decodeFileName)
            extPos = fileName.rfind(".")
            fileExt = fileName[extPos:]
            fileName = fileName[:extPos] + "_" + fileDate + fileExt
            fileName = fileName.replace(":", "_").replace("\n", "").replace("\r", "")

            fileName = fileName.replace("\t", "_")
            print(">>>>>>", fileName)
            filePath = os.path.join(savePath, fileName)
            fp = open(filePath, "wb")
            fp.write(part.get_payload(decode=True))
            fp.close()
            if fileExt == ".zip":
                with zipfile.ZipFile(filePath, "r") as zip_ref:
                    zip_ref.extractall(savePath)
                os.chdir(savePath)
                renFiles = glob.glob("*.txn")
                if renFiles:
                    for txn in renFiles:
                        os.rename(txn, "wesbank.txn")
                moveFiles = glob.glob("*.txn")
                if moveFiles:
                    for wesbank in moveFiles:
                        shutil.move(savePath + wesbank, movePath + wesbank)
                os.chdir(movePath)
                txnFile = glob.glob("*.txn")
                if txnFile:  # if the attachment is a txn file, import it
                    for txn in renFiles:
                        # vars for import and push
                        wesbank_fuel(clientID, txnFile)
                os.chdir(savePath)
    imap.close()
    imap.logout()


def wesbank_fuel(clientID, txnFile):
    movePath = f"c:/mfa_imports/{clientID}/"
    client_path = "c:/mfa_imports/" + clientID + "/"
    processed_path = client_path + "processed/"
    connCrunch = MFAprocs.connectToMFAdb(clientID="mfa_crunch")
    connClient = MFAprocs.connectToMFAdb(clientID=clientID.lower())
    for files in txnFile:
        # print("?TXN FILESS")
        # print(files)
        if files == "wesbank.txn":
            # Generate  md5 hash string
            md5_hash = hashlib.md5()
            with open(movePath + files, "rb") as f:
                # print(f)
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
            cur.close()
            if not md5_checksum:
                print("Wesbank file written to DB...")
                cur = connCrunch.cursor()
                cur.callproc(
                    "imports.import_wesbank_card_data",
                    [
                        clientID.upper(),
                    ],
                )
                cur.close()
                connCrunch.commit()

                # Call crunch_import stored proc
                cur = connCrunch.cursor()
                cur.callproc(
                    "mfaglb.crunch_import",
                    [
                        "{" + '"_client_id"' + ":" + '"' + clientID.upper() + '"' + "}",
                    ],
                )
                cur.close()
                connCrunch.commit()

                # Call push_import stored proc
                cur = connClient.cursor()
                cur.callproc(
                    "fleet.push_import",
                    [
                        "{" + '"_client_id"' + ":" + '"' + clientID.upper() + '"' + "}",
                    ],
                )
                cur.close()
                connClient.commit()

                # Call update_last_push stored proc
                cur = connCrunch.cursor()
                cur.callproc(
                    "mfaglb.update_last_push",
                    [
                        "{" + '"_client_id"' + ":" + '"' + clientID.upper() + '"' + "}",
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
                if not os.path.isdir(processed_path):
                    os.mkdir(processed_path)

                # Generate & save processed file
                src = client_path + files
                dest = processed_path + files
                if glob.glob(src):
                    shutil.move(src, dest)
                    os.rename(dest, dest + dateStr)
            else:
                print("Wesbank file not to DB, hash:", hash5Str)
                if glob.glob("wesbank.txn"):
                    os.remove("wesbank.txn")
        # os.remove(files)


# If there are no unread mails in a dci zone inbox, send notification mail
def sendNoMailNotif(clientID):
    message = MIMEMultipart()
    message["Subject"] = f"No Mail In Inbox - {clientID}"
    Body = f"No new emails in {clientID} DCI inbox"
    message["From"] = mailSettings["senderAddress"]
    with smtplib.SMTP(mailSettings["smtp_server"], mailSettings["port"]) as server:
        server.ehlo()
        server.starttls()
        server.login(mailSettings["senderAddress"], mailSettings["senderPW"])
        # Add body to email
        message.attach(MIMEText(Body, "plain"))
        # Encode file in ASCII characters to send by email
        # encoders.encode_base64(part)

        text = message.as_string()
        # Log in to server using secure context and send email
        server.sendmail(mailSettings["senderAddress"], errorMailRecipients, text)
    # imap_user = f"{clientID}@dcizone.com"
    # imap_pass = f"{clientID}12#"
    # imap = imaplib.IMAP4_SSL(imap_host)
    # ## login to server
    # imap.login(imap_user, imap_pass)
    # body = "No scheduled email received for " + clientID
    # smtp_server = "mail.dcizone.com"
    # port = 587  # For starttls
    # message = MIMEMultipart()
    # message["From"] = mailSettings["senderAddress"]
    # message["Subject"] = f"Error in {clientID} mail/import routine"
    # message["To"] = ", ".join(errorMailRecipients)
    # msgBody = MIMEText(body, "plain")
    # message.attach(msgBody)
    # # Create SSL context
    # context = ssl._create_unverified_context()
    # # Try to log in to server and send email
    # try:
    #     server = smtplib.SMTP(smtp_server, port)
    #     server.ehlo()  # Can be omitted
    #     server.starttls(context=context)  # Secure the connection
    #     server.ehlo()  # Can be omitted
    #     server.login(mailSettings["senderAddress"], mailSettings["senderPW"])
    #     server.sendmail(
    #         mailSettings["senderAddress"], errorMailRecipients, message.as_string()
    #     )
    # except Exception as e:
    #     logFile = "C://logFileplaceholder.txt"
    #     sendErrorMail(
    #         client_id=clientID,
    #         script_name=sys.argv[0],
    #         log_file=logFile,
    #         error_traceback=traceback.format_exc(),
    #     )
    #     print("Error occurred, see log file." + "\n" + traceback.format_exc())
    # finally:
    #  