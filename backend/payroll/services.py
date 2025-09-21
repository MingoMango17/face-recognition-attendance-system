facedb = None

def get_facedb():
    global facedb
    return facedb

def set_facedb(instance):
    global facedb
    facedb = instance