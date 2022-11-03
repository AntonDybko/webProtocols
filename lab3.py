import paramiko

client = paramiko.SSHClient()
client.load_system_host_keys()
client.connect('sigma.ug.edu.pl')
#stdin, stdout, stderr = client.exec_command("ls")

ftp_client = client.open_sftp()
ftp_client.get("~/Pulpit/file.txt", "~/Pulpit/katalog4/file.txt")
ftp_client.close()