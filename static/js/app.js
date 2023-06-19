class Session extends Map {
    set(id, value) {
      if (typeof value === 'object') value = JSON.stringify(value);
      sessionStorage.setItem(id, value);
    }
  
    get(id) {
      const value = sessionStorage.getItem(id);
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    }
  }
  



class StopsData{

}


class UserInterfaceManager
{

}



class App{
    constructor(){
        console.log("initialized app!");
        this.session = new Session();
        this.UserInterfaceManager = new UserInterfaceManager();

        this.initialDataInfo = {
                                    0: {"full_name": "stops data", "name": "stops_data", "handler": StopsData, "expired_time": 10}
                               };

        this.checkInitialData();
        this.fetchInitialData();
    }

    checkInitialData(){
        console.group("initial data presence");
        for (let entry in this.initialDataInfo) {
            entry = this.initialDataInfo[entry];
            let data = this.session.get(entry["name"]);
            if(data == null)
            {
                console.log(entry["full_name"] + " is not fetched");
                entry["is_fetched"] = false;
            }else
            {
                let today_time = new Date();
                let data_time = new Date(parseInt(this.session.get(entry["name"]+"_time")));
                if((today_time.getTime() - data_time.getTime()) / 1000 > entry["expired_time"]){
                    console.log(entry["full_name"] + " expired");
                    entry["is_fetched"] = false;
                }
                else{
                    console.log(entry["full_name"] + " exist");
                    entry["is_fetched"] = true;
                }
                
            }
            
        }
        console.groupEnd();

        this.session.set("stops_data", "xD");
        this.session.set("stops_data_time", new Date().getTime());
        console.log(this.session.get("stops_data_time"));
        
    }

    destroyInitialData()
    {
        sessionStorage.clear();
    }

    fetchInitialData(){
        for (let entry in this.initialDataInfo) {
            entry = this.initialDataInfo[entry];

            if(entry["fetched"] == false)
            {

            }
            else
            {

            }
        }
    }
}


var app = new App();




var map = L.map('map').fitWorld();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
}).addTo(map);


map.setView([54.3520500, 18.6463700], 12);