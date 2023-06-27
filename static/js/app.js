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
        this.requester = new Requester();

        this.initialDataInfo = {
                                    0: {"full_name": "stops data", "name": "stops_data", "expired_time": 10, "url": "https://ckan.multimediagdansk.pl/dataset/c24aa637-3619-4dc2-a171-a23eec8f2172/resource/d3e96eb6-25ad-4d6c-8651-b1eb39155945/download/stopsingdansk.json"}
                               };

        this.fetch_delay = 1000;
        
        this.map = null;

        this.mapLayers = {"stop": [],
                          "tram": [],
                           "bus": [],
                           "other": []
                        }

        
    }

    start()
    {
        this.createMap();
        this.checkInitialData();
        this.fetchInitialData();

        this.displayStops();

        console.log("end")
    }

    createMap(){
        this.map = L.map('map').fitWorld();

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: ''
        }).addTo(this.map);


        this.map.setView([54.3520500, 18.6463700], 12);

        let marker = L.marker([54.43483479706698, 18.624774574836078], {icon: stopIcon}).addTo(this.map);
    }

    displayStops(){   
        let stops_data = this.session.get("stops_data");
        console.log(stops_data);
        for(let entry in stops_data["stops"])
        {
            entry = stops_data["stops"][entry];
            let name = entry["stopName"];
            let lat = entry["stopLat"];
            let lon = entry["stopLon"];
            let demand = entry["onDemand"];
            let code = entry["stopCode"];
            let stopId = entry["stopId"];

            let desc = "<p class='stop_name' id='"+stopId+"' data-id='"+stopId+"' >" + name + " " + code + "</p>";
            if(demand == true)
            {
                desc += "<p style='text-align:center;'>(Na żądanie)</p>"
            }
            let marker = L.marker([lat, lon], {icon: stopIcon}).addTo(this.map);
            marker.bindPopup(desc);
            this.mapLayers["stop"].push(marker);

        }
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

                if(current_index +1 >= Object.keys(app.initialDataInfo).length)
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


app.map.on('popupopen', function(e) {
    let stopID = e.popup._contentNode.firstChild.dataset.id;

    function get(element, url)
    {
        let xmlHttp = new XMLHttpRequest();
        xmlHttp.onreadystatechange = function() { 
            if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            {
                let response = JSON.parse(xmlHttp.responseText);
                console.log(response);
                if(Object.keys(response["departures"]).length == 0){
                    e.popup.setContent(e.popup._content + "<p>Brak Odjazdów</p>");
                    return;
                }

                let table = "<table><tr><th>nazwa linii</th><th>numer</th><th>czas</th><th>status</th></tr>";
                for(let entry in response["departures"])
                {
                    entry = response["departures"][entry];
                    let status = "<img style='width:2vw;' src='static/images/"
                    if(entry["status"] == "REALTIME"){
                        status += "realtime_status.png";
                    }
                    else if(entry["status"] == "SCHEDULED"){
                        status += "scheduled_status.png";
                    }
                    else{
                        status += "unknown_status.png";
                    }
                    status += "' alt='status'>"

                    table += "<tr><td>"+entry["headsign"]+"</td><td>"+entry["routeId"]+"</td><td>"+entry["estimatedTime"]+"</td><td>"+status+"</td></tr>";
                }
                table += "</table>"
                e.popup.setContent(e.popup._content + table);
            }               
        }
        xmlHttp.open("GET", url, true);
        xmlHttp.send(null);
    }

    get(e, "http://ckan2.multimediagdansk.pl/departures?stopId="+ stopID, )
    
    
  });
  