# node-red-contrib-serialups

Provides a node that is able to query the status of EP 2000 Pro based UPS units over the USB connection.

Personally tested only with SILVERCLOUD PNI-SCP850, 600W

The node has 2 outputs:
1. Provides periodic status updates (each 10 sec)
2. Message is emitted with the current UPS work state (to detect power outtage)
