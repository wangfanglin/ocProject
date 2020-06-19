/**
 * Created by qiuyong on 2017/7/25.
 */
define([
  "bs-http-plugin/bs-print",
  "bs-http-plugin/bs-ca-auth",
  "bs-http-plugin/bs-pd",
  "bs-http-plugin/bs-pos",
  "bs-http-plugin/bs-upload",
  "bs-http-plugin/bs-doccamera",
],function (Print,CA,PD,POS,Upload,Doccamera) {
  var Index = function () {

  };
  Index.prototype = {
    constructor:Index,
    init:function () {
      function getInstance(){
        return Print.getInstance({
          config: {
            appId: 'gov-aims'
          },
          onError: function () {
            //console.log(arguments);
          },
          initOptions: {
            Cookie: '111111111111111111',
            HostUrl: $A.getHostUrl(),
            DownLoadUrl: 'xxx.do',
            QueryTempListUrl: 'xxx.do',
            QueryTempNameUrl: 'xxx.do'
          }
        });
      }

      window.exportMethod = function (data) {
        var print = getInstance();
        var template = data.templateName;
        var printName = data.fileName;
        var templateUrl = $A.getHostUrl() + '/static/print/template/' + template + ".grf";//模板地址
        var PrintSet;
        $A.showWaitScreen("正在导出PDF");
        print.getPrintSet({ModuleId: '00000000'}).then(function (printSet) {
          PrintSet = printSet;
          return data.data;
        }).then(function (data) {
          var printData = [];
          $(data).each(function (index, item) {
            printData.push({
              Data: item,
              Name: printName + index
            })
          });
          return print.exportMedia({
            PrintData: printData,
            PrintSet: PrintSet,
            ExportType: "Excel",//PDF/Excel(默认PDF)
            LoadReportURL: templateUrl,
            tempVersion: "0.1"
          })
        }).then(function () {
          $A.messager.correct('success');
        }).fail(function () {

        }).always(function () {
          $A.hideWaitScreen()
        });
      };

      window.printMethod = function (data) {
        //打印控件
        var instance = getInstance();
        var template = data.templateName;
        var printSetDfd = instance.getPrintSet({ModuleId: '00000000'});
        var printSet = {};
        printSetDfd.then(function (PrintSet) {
          printSet = PrintSet;
          if(data.direction){
            printSet.Direction = data.direction;
          };
          if(data.printSet){
            Object.assign(printSet,data.printSet)
          };
          if (data.type === '1') {//请求后台
            return $.ajax({
              url: data.url,
              data: data.parme,
              dataType: 'json'
            });
          } else {
            return data.data;
          }
        }).then(function (printData) {
          console.log($A.getHostUrl().substr(0, $A.getHostUrl().length - 2) + '/pub/fileDownload?attachId=' + template);
          return instance.doPreview({
            // LoadReportURL: $A.getHostUrl().substr(0, $A.getHostUrl().length - 2) + '/static/print/template/' + template + ".grf",
            LoadReportURL: $A.getHostUrl().substr(0, $A.getHostUrl().length - 2) + '/pty/pub/fileDownload?attachId='+template,
            PrintPreview: data.isPreview,//是否要预览
            PrintData: printData,
            PrintSet: printSet,
            // MessageDialog:false,
            // PrintSize:1,
            ShowForm: true,
            PrintCallBack: function () {
              //console.log("click print!");
            },
            ProcessChange: function (data, index, count) {
              //console.log(data,"总共"+count+"条数据,已经打印"+index+"条");
            }
          }).then(function () {

          })
        }).done(function () {
          //console.log('doPreview success');
        }).fail(function () {
          //console.log('doPreview error');
        });
      };

      $("#doImage").on('click',function () {
        var instance = getInstance();
        var template = $('#template').val();
        var printSetDfd = instance.getPrintSet({ModuleId:'00000000'});
        var flgDfd = $.Deferred();
        printSetDfd.then(function (PrintSet) {
          var dfd = $.Deferred();
          $.ajax({
            url:'template/'+template+".txt",
            dataType:'json',
            success:function (data) {
              dfd.resolve({data:data,PrintSet:PrintSet});
            },
            error:function(e){
              dfd.reject(e);
            }
          });
          return dfd;
        }).then(function (data) {
          return instance.doImage({
            LoadReportURL:$A.getHostUrl()+'template/'+template+".grf",
            PrintData:data.data,
            PrintSet:data.PrintSet
          })
        }).done(function (data) {
          $(imgbox).empty();
          $(data.list).each(function (index,item) {
            var $img = $('<img>')
            $img.attr('src',data.url+"?fn="+item);
            $img.width("90%");
            $img.css("margin","0 auto");
            $img.css("display","inline-block");
            $(imgbox).append($img);
          })
        }).fail(function () {
        });
      });
    }
  }
  return new Index;
});
