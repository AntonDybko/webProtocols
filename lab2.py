import paramiko

client = paramiko.SSHClient()
client.load_system_host_keys()
client.connect('sigma.ug.edu.pl')
stdin, stdout, stderr = client.exec_command("cat ~/.ssh/config1")
#stdin, stdout, stderr = client.exec_command("ss | grep ssh | wc -l")
if bool(list(stderr)):
    print("File not found")
else:
    for l in list(stdout):
        print(l)
