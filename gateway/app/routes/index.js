const express = require("express");
const router = express.Router();
const axios = require('axios');
const registry = require('./registry.json');
const fs = require('fs');
const loadbalancer = require("../util/loadbalancer");
const { resolveSoa } = require("dns");

router.post('/enable/:apiName', (req, res) => {
    const apiName = req.params.apiName;
    const requestBody = req.body;
    const instances = registry.services[apiName].instances;
    const index = instances.findIndex((service) => {
        // console.log(service.url, requestBody.url);
        return service.url === requestBody.url
    });
    if(index == -1){
        res.send({status: "error", message: "Could not find '" + requestBody.url + "' for service '" + apiName + "'" });
    }else{
        instances[index].enabled = requestBody.enabled;

        fs.writeFile(
            './app/routes/registry.json', 
            JSON.stringify(registry), 
            (err) => {
                if(err){
                    res.send("Could not enable/disable '" + requestBody.url + "' for service '" + apiName + "'\n" + err);
                }else{
                    res.send("Sucessfully enabled/disabled '" + requestBody.url + "' for service '" + apiName + "'");
                }
        });
    }




})

router.all('/:apiName/*', (req, res) => {

    const service = registry.services[req.params.apiName];

    if(!service){
        return res.status(404).send("API name doesn't exist");
    }

    if(!service.loadBalanceStrategy){
        service.loadBalanceStrategy = "ROUND_ROBIN";
        fs.writeFile(
            './app/routes/registry.json', 
            JSON.stringify(registry), 
            (err) => {
                if(err){
                    res.send("Could not register load balance strategy");
                }
        });
    }
    const newIndex = loadbalancer[service.loadBalanceStrategy](service);
    const url = service.instances[newIndex].url;
    console.log("URL:", url);

    const path = req.path.replace("/" + req.params.apiName + "/","");
    axios({
        method: req.method,
        url: url + path,
        headers: req.headers,
        data: req.body
    })
    .then((response) => {
        return res.send(response.data);
    })
    .catch((err) => {
        return res.status(err.response.status).send(err.response.data);
    })
})

router.post('/register', (req,res) => {
    const registrationInfo = req.body;
    registrationInfo.url = registrationInfo.protocol + "://" + registrationInfo.host + ":" + registrationInfo.port + "/";

    if(apiAlreadyExists(registrationInfo)){
        res.send("Configuration already exists for " + registrationInfo.apiName + " at '" + registrationInfo.url + "'");
    }else{
        registry.services[registrationInfo.apiName].instances.push({ ...registrationInfo });
   
        fs.writeFile(
            './app/routes/registry.json', 
            JSON.stringify(registry), 
            (err) => {
                if(err){
                    res.send("Could not register " + registrationInfo.apiName + "\n" + err);
                }else{
                    res.send("Sucessfully registered " + registrationInfo.apiName);
                }
        });
    } 
})

router.post('/unregister', (req, res) => {
    const registrationInfo = req.body;
    registrationInfo.url = registrationInfo.protocol + "://" + registrationInfo.host + ":" + registrationInfo.port + "/";

    if(apiAlreadyExists(registrationInfo)){
        const index = registry.services[registrationInfo.apiName].instances.findIndex((instance) => {
            return registrationInfo.url === instance.url;
        });

        registry.services[registrationInfo.apiName].instances.splice(index, 1);

        fs.writeFile(
            './app/routes/registry.json', 
            JSON.stringify(registry), 
            (err) => {
                if(err){
                    res.send("Could not unregister " + registrationInfo.apiName + "\n" + err);
                }else{
                    res.send("Sucessfully unregistered " + registrationInfo.apiName);
                }
        });

    }else{
        res.send("Configuration does not exists for " + registrationInfo.apiName + " at '" + registrationInfo.url + "'");
    }

})

const apiAlreadyExists = (registrationInfo) => {
    let exists = false;
    registry.services[registrationInfo.apiName].instances.forEach(instance => {
        if(instance.url === registrationInfo.url){
            exists = true;
            return exists;
        }
    })
    return exists;
}

module.exports = router;