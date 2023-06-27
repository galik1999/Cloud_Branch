from firebase import firebase 

class Database():
    def __init__(self, db_url) -> None:
        self.db_url = db_url
        self.db_connection = firebase.FirebaseApplication(self.db_url,None)

    def get_data(self,collection):
      try:
        result = (self.db_connection).get("/" + collection + "/", None)
      except:
        return "Somthing went wrong 404"
      return result
    
    def update_data(self, collection, target, data):
        for key in data:
            (self.db_connection).put(("/" + collection + "/"+target), key, data[key])
    
    def delete_data(self,collection,key):
        (self.db_connection).delete('/' + collection,str(key))
    def post_data(self, collection, data):
        result = (self.db_connection).post("/" + collection + "/", data)
        return result
