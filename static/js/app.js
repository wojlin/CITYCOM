class Session extends Map {
    set(id, value) {
      if (typeof value === 'object') value = JSON.stringify(value);
      console.log(id, value);
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
  



class Requester
{
    constructor()
    {

    }

    get(url, callback)
    {
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            {
                callback(JSON.parse(xmlHttp.responseText));
            }               
        }
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }
}


class UserInterfaceManager
{
    
    constructor()
    {
        this.fetchingScreen = document.getElementById("fetching_screen");
        this.fetchingScreenText = document.getElementById("fetching_screen_text");
        this.delay = 500;
    }

    showFetchingScreen(){
        this.fetchingScreen.style.display = "block";
    }

    hideFetchingScreen()
    {
        this.fetchingScreen = document.getElementById("fetching_screen");
        this.fetchingScreen.style.display = "none";
    }

    hideFetchingScreenDelay(){
        setTimeout(this.hideFetchingScreen, this.delay);
    }

    updateFetchingScreen(data){
        this.fetchingScreenText.innerHTML = data.toString();
    }
}



class App{
    constructor(){
        console.log("initialized app!");
        this.session = new Session();
        this.UserInterfaceManager = new UserInterfaceManager();

        this.initialDataInfo = {
                                    0: {"full_name": "stops data", "name": "stops_data", "expired_time": 10, "url": "https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/d3e96eb6-25ad-4d6c-8651-b1eb39155945/download/stopsingdansk.json"}
                               };

        this.fetch_delay = 1000;

        
    }

    start()
    {
        this.checkInitialData();
        this.fetchInitialData();

        console.log("end")
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

        //this.session.set("stops_data", "xD");
        //this.session.set("stops_data_time", new Date().getTime());
        console.log(this.session.get("stops_data_time"));
        
    }

    destroyInitialData()
    {
        sessionStorage.clear();
    }

    saveData(id, value)
    {
        this.session.set(id, value);
    }


    fetchInitialData(current_index){
        app.UserInterfaceManager.showFetchingScreen();
        if(current_index == undefined){
            current_index = 0;
        }

        console.log(current_index)

        console.log(app.initialDataInfo)
        if(current_index >= Object.keys(app.initialDataInfo).length)
        {
            console.log("hide");
            app.UserInterfaceManager.hideFetchingScreenDelay();
            return;
        }     

        let entry = app.initialDataInfo[current_index];

        if(entry["is_fetched"] == false)
        {
            app.UserInterfaceManager.updateFetchingScreen("fetching " + entry["full_name"] + "...");
                
        }else
        {
            current_index++;
            app.fetchInitialData(current_index);
            return;
        }
         
            
        var xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            {
                app.saveData(entry["name"], JSON.parse(xmlHttp.responseText));
                app.saveData("stops_data_time", new Date().getTime());

                if(current_index >= Object.keys(app.initialDataInfo).length)
                {
                    console.log("hide")
                    app.UserInterfaceManager.hideFetchingScreenDelay();
                }     
                else
                {
                    current_index++;
                    console.log("fetch")
                    setTimeout(app.fetchInitialData, app.fetch_delay, current_index);
                }               
            }
        }
        xmlHttp.open("GET", entry["url"], true);
        xmlHttp.send(null);
        
    }
    
}


var app = new App();
app.start();



var map = L.map('map').fitWorld();

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: ''
}).addTo(map);


map.setView([54.3520500, 18.6463700], 12);