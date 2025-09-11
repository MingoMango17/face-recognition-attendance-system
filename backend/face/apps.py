from django.apps import AppConfig
from facedb import FaceDB

class FaceConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'face'
    
    def ready(self):
        if not hasattr(self, '_facedb_initialized'):
            from .services import set_facedb
            facedb_instance = FaceDB(path="facedata")
            set_facedb(facedb_instance)
            self._facedb_initialized = True