/**
 * Created by qiu.yong on 2017/5/16.
 */
define([
    /*"app/core/app-jquery",//(ok)
    "app/core/app-core",//(ok)*/
    "bs-http-plugin/config-ext"//(ok)
], function (GlobalConfig) {

    var Config = {
        version:'1.0',
        url:'http://127.0.0.1:13526/',
        guardUrl:'http://127.0.0.1:13528/controlMainApp',
        heartbeat:'heart',
        update:'update',
        startUrl:'BosssoftAssistant://',
        cookies: window._cookies||'no-cookies',
        timeout:2000,
        sliceSize:1024
    }
    /*var gcfg = GlobalConfig["bs-client-config"];
    if(gcfg){
        $.extend(Config,gcfg);
    }*/
    return Config;
});