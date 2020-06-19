require.config({
	baseUrl: "/static/print/js/",
	shim: {
		"output/app": {
            deps: [
                "jquery"
            ]
        }
	}
});
/**
 * establish history variables
 */
var localeFile=(window.localeFile?window.localeFile:"app/widgets/app-lang_zh_CN");

var initJsList=["app/core/app-jquery","app/core/app-core","base/dotpl-js","index/index"];

require(["output/app"],function () {
	require(initJsList, function ($,App,template,appJSObj){

    window.jQuery = $;
		window.$=$;
		$.browser = {};
		$.browser.mozilla = /firefox/.test(navigator.userAgent.toLowerCase());
		$.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
		$.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
		$.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

		window.$template=function(render,vars){
			return template.applyTpl(render,vars);
		};

		/**
		 * 增加启动方法
		 */
		window.$app =window.$A=window.$a= App;
		$A.setContextPath("/static");
		if (appJSObj.__proto__ && appJSObj.__proto__.init){
			appJSObj.__proto__.init();
		}

	});
});
