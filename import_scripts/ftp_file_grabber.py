import paramiko, pysftp
import os

hostname = '196.10.112.7'
port= 22
username = 'sftpMacrocomm'
password = 'Ai95U3VS'
remote_path = '/'
local_path = '/tmp/'


def retrieve_sftp_files():
    # client = paramiko.SSHClient()
    cnopts = pysftp.CnOpts()
    # host_key = paramiko.RSAKey(filename=)
    cnopts.hostkeys = None
    with pysftp.Connection(
        host=hostname, username=username, password=password, cnopts=cnopts
    ) as sftp:
        remote_files = sftp.listdir(remote_path)
        print(remote_files)
        for file in remote_files:
            remote_file_path = os.path.join(remote_path, file)
            local_file_path = os.path.join(local_path, file)
            sftp.get(remote_file_path, local_file_path)
            print(f"Downloaded {local_file_path}")
            sftp.remove(remote_file_path)
            print(f"Deleted {remote_file_path}")


# client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

# client.connect(hostname, port, username, password)

# sftp = client.open_sftp()

# files = sftp.listdir(remote_path)

# print(files)


# sftp.close()
# client.close()
