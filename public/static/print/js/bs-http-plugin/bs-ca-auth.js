
define(['bs-http-plugin/base-pluginvoke'], function(BasePluginvoke) {

    /**
     * @desc ca认证控件 使用请引入 'bs-http-plugin/bs-ca-auth'
     * @class
     * @classdesc
     * @name bs-ca-auth
     * @extends base-pluginvoke
     */
    var CaAuth = BasePluginvoke.extend({
        /**
         * @description dll名称
         * @memberOf bs-ca-auth
         * @instance
         * @example
         * module:'ca'
         */
        module:'ca',
        /**
         * @description 自动生成函数列表
         */
        functions:[
            /**
             * @function doSign
             * @instance
             * @memberOf bs-ca-auth
             * @description CA签名验证
             * @param {object} options
             * @param {string} options.signText 待签名串
             * @param {string} options.provider 签名供应者 'Jit'、'Kinsec'、'LNJH'
             * @returns {object}
             *
             * @example
             * var instance = CaAuth.getInstance();
             * instance.doSign({
			 * 	signText:'xxxx',
			 * 	provider:'Jit'
			 * }).done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             *
             *
             * //会自动获取后台配置项，前提有配置全局变量     window._caProvider
             * var instance = CaAuth.getInstance();
             * instance.doSign('xxxx').done(function(data){
			 * 		//TODO success
			 * }).fail(function(){
			 * 		//TODO error
			 * })
             */
            'doSign',

            'initParams'
        ],
        doSign:function (data) {
            var sendData = {
                signText:'',
                provider:undefined
            };
            if($.type(data)==='object'){
                sendData.signText = data.signText;
                if($.type(data.provider)=='string'){
                    sendData.provider = data.provider;
                }
            }else if($.type(data)==='string'){
                sendData.signText = data;
                sendData.provider = $A.getCaProvider();
            }
            if($.type(sendData.cryptoType)!='string'){
                sendData.cryptoType = $A.getCaCryptoType();
            }

            if($.type(sendData.provider)!='string'){
                return $.Deferred().reject('CA验证提供商为空');
            }

            //用户
            return this.operate({
                data:[sendData],
                func:'doSign'
            })
        },
        validateSN:function (data) {
            var sendData = {
                signText:'',
                provider:undefined,
                validateSN:true
            };
            if($.type(data)==='object'){
                sendData.signText = data.signText;
                if($.type(data.provider)=='string'){
                    sendData.provider = data.provider;
                }
            }else if($.type(data)==='string'){
                sendData.signText = data;
                sendData.provider = $A.getCaProvider();
            }

            if($.type( sendData.provider)!='string'){
                return $.Deferred().reject('CA验证提供商为空');
            }
            var cardInfo = $A.getCaInfo();
            if(!cardInfo||!cardInfo.caNo){
                var msg = "Ukey信息与当前ca产商不一致，请联系管理员！";
                return $.Deferred().reject(msg);
            }
			sendData.certNo = cardInfo.caNo;

            //用户
            return this.operate({
                data:[sendData],
                func:'doSign'
            })
        },
        Statics:{
            /**
             * @description 获取打印控件实例
             * @static
             * @memberOf bs-ca-auth
             * @function getInstance
             * @param {object} op
             * @param {object} op.config dll配置
             * @param {string} op.config.appId 应用Id(<span style="color:red">必填</span>)
             * @example
             *         var instantce = CaAuth.getInstance({
             *          config:{
             *              appId:'123'
             *          }
             *         });
             */
            getInstance:function(op){
                if (!this.instance){
                    this.instance =new CaAuth(op);
                }
                return this.instance;
            }
        }
    });
    return CaAuth;
});