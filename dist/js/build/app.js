var tr,
  extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
  hasProp = {}.hasOwnProperty,
  bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  slice = [].slice;

this.helpers = {};

this.config = {
  "static": {
    appTitle: 'Kodi',
    jsonRpcEndpoint: 'jsonrpc',
    socketsHost: location.hostname,
    socketsPort: 9090,
    ajaxTimeout: 5000,
    connected: true,
    hashKey: 'kodi',
    defaultPlayer: 'auto',
    ignoreArticle: true,
    pollInterval: 10000,
    reverseProxy: false,
    albumArtistsOnly: true,
    searchIndexCacheExpiry: 24 * 60 * 60,
    collectionCacheExpiry: 7 * 24 * 60 * 60,
    addOnsLoaded: false,
    vibrantHeaders: false,
    lang: "en",
    kodiSettingsLevel: 'standard',
    playlistFocusPlaying: true,
    keyboardControl: 'kodi',
    disableThumbs: false,
    showDeviceName: false,
    refreshIgnoreNFO: true,
    largeBreakpoint: 910,
    apiKeyTMDB: '',
    apiKeyTVDB: '',
    apiKeyFanartTv: '',
    apiKeyYouTube: ''
  }
};

this.Kodi = (function(Backbone, Marionette) {
  var App;
  App = new Backbone.Marionette.Application();
  App.addRegions({
    root: "body"
  });
  App.on("before:start", function() {
    return config["static"] = _.extend(config["static"], config.get('app', 'config:local', config["static"]));
  });
  App.vent.on("shell:ready", (function(_this) {
    return function(options) {
      return App.startHistory();
    };
  })(this));
  return App;
})(Backbone, Marionette);

$(document).ready((function(_this) {
  return function() {
    return helpers.translate.init(function() {
      Kodi.start();
      $.material.init();
      return helpers.ui.bindOnScrollResize();
    });
  };
})(this));


/*
  Helper to return you to the same scroll position on the last page.
 */

helpers.backscroll = {
  lastPath: '',
  lastScroll: 0,
  setLast: function() {
    this.lastPath = location.hash;
    return this.lastScroll = document.body.scrollTop;
  },
  scrollToLast: function() {
    var scrollPos;
    scrollPos = this.lastPath === location.hash ? this.lastScroll : 0;
    if (scrollPos > 0) {
      return window.scrollTo(0, scrollPos);
    }
  }
};


/*
  Our cache storage, persists only for app lifecycle
  Eg. gets wiped when page reloaded.
 */

helpers.cache = {
  store: {},
  defaultExpiry: 406800
};

helpers.cache.set = function(key, data, expires) {
  if (expires == null) {
    expires = helpers.cache.defaultExpiry;
  }
  helpers.cache.store[key] = {
    data: data,
    expires: expires + helpers.global.time(),
    key: key
  };
  return data;
};

helpers.cache.get = function(key, fallback) {
  if (fallback == null) {
    fallback = false;
  }
  if ((helpers.cache.store[key] != null) && helpers.cache.store[key].expires >= helpers.global.time()) {
    return helpers.cache.store[key].data;
  } else {
    return fallback;
  }
};

helpers.cache.del = function(key) {
  if (helpers.cache.store[key] != null) {
    return delete helpers.cache.store[key];
  }
};

helpers.cache.clear = function() {
  return helpers.cache.store = {};
};

helpers.cache.updateCollection = function(collectionKey, responseKey, modelId, property, value) {
  var i, item, ref, results1;
  if ((Backbone.fetchCache._cache != null) && (Backbone.fetchCache._cache[collectionKey] != null) && (Backbone.fetchCache._cache[collectionKey].value.result != null)) {
    if (Backbone.fetchCache._cache[collectionKey].value.result[responseKey] != null) {
      ref = Backbone.fetchCache._cache[collectionKey].value.result[responseKey];
      results1 = [];
      for (i in ref) {
        item = ref[i];
        if (item.id === modelId) {
          results1.push(Backbone.fetchCache._cache[collectionKey].value.result[responseKey][parseInt(i)][property] = value);
        } else {
          results1.push(void 0);
        }
      }
      return results1;
    }
  }
};


/*
  Config Helpers.
  - Use config.get/set with 'app' as the type, to get/set persistent settings (localstorage)
  - Use config.getLocal/setLocal to get set temp storage
 */

config.get = function(type, id, defaultData, callback) {
  var data;
  if (defaultData == null) {
    defaultData = '';
  }
  data = Kodi.request("config:" + type + ":get", id, defaultData);
  if (callback != null) {
    callback(data);
  }
  return data;
};

config.set = function(type, id, data, callback) {
  var resp;
  resp = Kodi.request("config:" + type + ":set", id, data);
  if (callback != null) {
    callback(resp);
  }
  return resp;
};

config.getLocal = function(id, defaultData, callback) {
  return config.get('static', id, defaultData, callback);
};

config.setLocal = function(id, data, callback) {
  return config.set('static', id, data, callback);
};

config.setLocalApp = function() {
  return config.set('static', id, data, callback);
};

config.getAPIKey = function(id, defaultData) {
  var key;
  if (defaultData == null) {
    defaultData = '';
  }
  key = config.getLocal(id, '');
  if (key === '') {
    return atob(defaultData);
  } else {
    return key;
  }
};

config.preStartGet = function(id, defaultData) {
  var config;
  if (defaultData == null) {
    defaultData = '';
  }
  if ((typeof localStorage !== "undefined" && localStorage !== null) && (localStorage.getItem('config:app-config:local') != null)) {
    config = JSON.parse(localStorage.getItem('config:app-config:local')).data;
    if (config[id] != null) {
      return config[id];
    }
  }
  return defaultData;
};


/*
  Connection helpers. For live connecting and disconnecting from Kodi.
 */

helpers.connection = {};

helpers.connection.reconnect = function(success) {
  return helpers.connection.ping((function() {
    config.setLocal('connected', true);
    Kodi.execute('state:ws:init');
    return success();
  }), function() {
    return Kodi.execute('shell:disconnect');
  });
};

helpers.connection.disconnect = function() {
  return config.setLocal('connected', false);
};

helpers.connection.ping = function(success, fail) {
  var d;
  d = new Date();
  return $.ajax({
    url: helpers.url.baseKodiUrl("Ping"),
    timeout: 3000,
    contentType: 'application/json',
    type: 'POST',
    data: JSON.stringify({
      jsonrpc: '2.0',
      method: 'JSONRPC.Ping',
      params: {},
      id: d.getTime()
    }),
    success: success,
    error: fail
  });
};


/*
  Entities mixins, all the common things we do/need on almost every collection

  example of usage:

  collection = new KodiCollection()
    .setEntityType 'collection'
    .setEntityKey 'movie'
    .setEntityFields 'small', ['thumbnail', 'title']
    .setEntityFields 'full', ['fanart', 'genre']
    .setMethod 'VideoLibrary.GetMovies'
    .setArgHelper 'fields'
    .setArgHelper 'limit'
    .setArgHelper 'sort'
    .applySettings()
 */

if (this.KodiMixins == null) {
  this.KodiMixins = {};
}

KodiMixins.Entities = {
  url: function() {
    return helpers.url.baseKodiUrl("Mixins");
  },
  rpc: new Backbone.Rpc({
    useNamedParameters: true,
    namespaceDelimiter: ''
  }),

  /*
    Overrides!
   */

  /*
    Apply all the defined settings.
   */
  applySettings: function() {
    if (this.entityType === 'model') {
      return this.setModelDefaultFields();
    }
  },

  /*
    What kind of entity are we dealing with. collection or model
   */
  entityType: 'model',
  setEntityType: function(type) {
    this.entityType = type;
    return this;
  },

  /*
    Entity Keys, properties that change between the entities
   */
  entityKeys: {
    type: '',
    modelResponseProperty: '',
    collectionResponseProperty: '',
    idProperty: ''
  },
  setEntityKey: function(key, value) {
    this.entityKeys[key] = value;
    return this;
  },
  getEntityKey: function(key) {
    var ret, type;
    type = this.entityKeys.type;
    switch (key) {
      case 'modelResponseProperty':
        ret = this.entityKeys[key] != null ? this.entityKeys[key] : type + 'details';
        break;
      case 'collectionResponseProperty':
        ret = this.entityKeys[key] != null ? this.entityKeys[key] : type + 's';
        break;
      case 'idProperty':
        ret = this.entityKeys[key] != null ? this.entityKeys[key] : type + 'id';
        break;
      default:
        ret = type;
    }
    return ret;
  },

  /*
    The types of fields we request, minimal for search, small for list, full for page.
   */
  entityFields: {
    minimal: [],
    small: [],
    full: []
  },
  setEntityFields: function(type, fields) {
    if (fields == null) {
      fields = [];
    }
    this.entityFields[type] = fields;
    return this;
  },
  getEntityFields: function(type) {
    var fields;
    fields = this.entityFields.minimal;
    if (type === 'full') {
      return fields.concat(this.entityFields.small).concat(this.entityFields.full);
    } else if (type === 'small') {
      return fields.concat(this.entityFields.small);
    } else {
      return fields;
    }
  },
  modelDefaults: {
    id: 0,
    fullyloaded: false,
    thumbnail: '',
    thumbsUp: false
  },
  setModelDefaultFields: function(defaultFields) {
    var field, len, n, ref, results1;
    if (defaultFields == null) {
      defaultFields = {};
    }
    defaultFields = _.extend(this.modelDefaults, defaultFields);
    ref = this.getEntityFields('full');
    results1 = [];
    for (n = 0, len = ref.length; n < len; n++) {
      field = ref[n];
      results1.push(this.defaults[field] = '');
    }
    return results1;
  },

  /*
    JsonRPC common patterns and helpers.
   */
  callMethodName: '',
  callArgs: [],
  callIgnoreArticle: true,
  setMethod: function(method) {
    this.callMethodName = method;
    return this;
  },
  setArgStatic: function(callback) {
    this.callArgs.push(callback);
    return this;
  },
  setArgHelper: function(helper, param1, param2) {
    var func;
    func = 'argHelper' + helper;
    this.callArgs.push(this[func](param1, param2));
    return this;
  },
  argCheckOption: function(option, fallback) {
    if ((this.options != null) && (this.options[option] != null)) {
      return this.options[option];
    } else {
      return fallback;
    }
  },
  argHelperfields: function(type) {
    var arg;
    if (type == null) {
      type = 'small';
    }
    arg = this.getEntityFields(type);
    return this.argCheckOption('fields', arg);
  },
  argHelpersort: function(method, order) {
    var arg;
    if (order == null) {
      order = 'ascending';
    }
    arg = {
      method: method,
      order: order,
      ignorearticle: this.callIgnoreArticle
    };
    return this.argCheckOption('sort', arg);
  },
  argHelperlimit: function(start, end) {
    var arg;
    if (start == null) {
      start = 0;
    }
    if (end == null) {
      end = 'all';
    }
    arg = {
      start: start
    };
    if (end !== 'all') {
      arg.end = end;
    }
    return this.argCheckOption('limit', arg);
  },
  argHelperfilter: function(name, value) {
    var arg;
    arg = {};
    if (name != null) {
      arg[name] = value;
    }
    return this.argCheckOption('filter', arg);
  },
  buildRpcRequest: function(type) {
    var arg, func, key, len, n, ref, req;
    if (type == null) {
      type = 'read';
    }
    req = [this.callMethodName];
    ref = this.callArgs;
    for (n = 0, len = ref.length; n < len; n++) {
      arg = ref[n];
      func = 'argHelper' + arg;
      if (typeof func === 'function') {
        key = 'arg' + req.length;
        req.push(key);
        this[key] = func;
      } else {
        req.push(arg);
      }
    }
    return req;
  }
};


/*
  Handle errors.
 */

helpers.debug = {
  verbose: false
};


/*
  Debug styles

  @param severity
  The severity level: info, success, warning, error
 */

helpers.debug.consoleStyle = function(severity) {
  var defaults, mods, prop, styles;
  if (severity == null) {
    severity = 'error';
  }
  defaults = {
    background: "#ccc",
    padding: "0 5px",
    color: "#444",
    "font-weight": "bold",
    "font-size": "110%"
  };
  styles = [];
  mods = {
    info: "#D8FEFE",
    success: "#CCFECD",
    warning: "#FFFDD9",
    error: "#FFCECD"
  };
  defaults.background = mods[severity];
  for (prop in defaults) {
    styles.push(prop + ": " + defaults[prop]);
  }
  return styles.join("; ");
};


/*
  Basic debug message
 */

helpers.debug.msg = function(msg, severity, data) {
  if (severity == null) {
    severity = 'info';
  }
  if (typeof console !== "undefined" && console !== null) {
    console.log("%c " + msg, helpers.debug.consoleStyle(severity));
    if (data != null) {
      return console.log(data);
    }
  }
};


/*
  Log a debug error message.
 */

helpers.debug.log = function(msg, data, severity, caller) {
  if (data == null) {
    data = 'No data provided';
  }
  if (severity == null) {
    severity = 'error';
  }
  if (caller == null) {
    caller = arguments.callee.caller.toString();
  }
  if ((data[0] != null) && data[0].error === "Internal server error") {

  } else {
    if (typeof console !== "undefined" && console !== null) {
      console.log("%c Error in: " + msg, helpers.debug.consoleStyle(severity), data);
      if (helpers.debug.verbose && caller !== false) {
        return console.log(caller);
      }
    }
  }
};


/*
  Request Error.
 */

helpers.debug.rpcError = function(commands, data) {
  var detail, msg;
  detail = {
    called: commands
  };
  msg = '';
  if (data.error && data.error.message) {
    msg = '"' + data.error.message + '"';
    detail.error = data.error;
  } else {
    detail.error = data;
  }
  return helpers.debug.log("jsonRPC request - " + msg, detail, 'error');
};


/*
  JSON Dump (pretty print)
 */

helpers.debug.syntaxHighlight = function(json) {
  var out;
  json = JSON.stringify(json, null, 4);
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  out = json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function(match) {
    var cls;
    cls = 'number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'key';
      } else {
        cls = 'string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'boolean';
    } else if (/null/.test(match)) {
      cls = 'null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
  return '<pre class="json-syntax-highlight">' + out + '</pre>';
};


/*
  Entity Helpers
 */

helpers.entities = {};

helpers.entities.createUid = function(model, type) {
  var file, hash, id, uid;
  type = type ? type : model.type;
  id = model.id;
  uid = 'none';
  if (typeof id === 'number' || type === 'season') {
    uid = id;
  } else {
    file = model.file;
    if (file) {
      hash = helpers.global.hashEncode(file);
      uid = 'path-' + hash.substring(0, 26);
    }
  }
  return type + '-' + uid;
};

helpers.entities.getFields = function(set, type) {
  var fields;
  if (type == null) {
    type = 'small';
  }
  if (!_.isObject(set) || !set[type]) {
    [];
  }
  fields = set.minimal;
  if (type === 'full') {
    return fields.concat(set.small).concat(set.full);
  } else if (type === 'small') {
    return fields.concat(set.small);
  } else {
    return fields;
  }
};

helpers.entities.getSubtitle = function(model) {
  var subtitle;
  subtitle = '';
  switch (model.type) {
    case 'song':
      if (model.artist) {
        subtitle = model.artist.join(',');
      }
      break;
    default:
      subtitle = '';
  }
  return subtitle;
};

helpers.entities.playingLink = function(model) {
  return "<a href='#" + model.url + "'>" + (_.escape(model.label)) + "</a>";
};

helpers.entities.isWatched = function(model) {
  var watched;
  watched = false;
  if ((model != null) && model.get('playcount')) {
    watched = model.get('playcount') > 0 ? true : false;
  }
  return watched;
};

helpers.entities.setProgress = function($el, progress) {
  progress = progress + '%';
  return $el.find('.current-progress').css('width', progress).attr('title', progress + ' ' + t.gettext('complete'));
};

helpers.entities.buildOptions = function(options) {
  var defaultOptions;
  defaultOptions = {
    useNamedParameters: true
  };
  if (!options.filter) {
    defaultOptions.cache = true;
    defaultOptions.expires = config.get('static', 'collectionCacheExpiry');
  }
  return _.extend(defaultOptions, options);
};

helpers.entities.getAddonSearchMenuItems = function(query) {
  var addonSearch, addonSearches, len, n, ret;
  addonSearches = Kodi.request("addon:search:enabled");
  ret = '<li data-type="all" data-query="' + query + '">' + tr('Local media') + '</li>';
  if (addonSearches.length > 0) {
    ret += '<li class="divider"></li>';
    for (n = 0, len = addonSearches.length; n < len; n++) {
      addonSearch = addonSearches[n];
      ret += '<li data-type="' + addonSearch.id + '" data-query="' + query + '">' + tr(addonSearch.title) + '</li>';
    }
  }
  return ret;
};

helpers.entities.refreshEntity = function(model, controller, method, params) {
  var baseUrl, originalPath, refreshTimeout, thumbs, title, type;
  if (params == null) {
    params = {};
  }
  title = model.get('label');
  type = model.get('type');
  originalPath = model.get('url');
  refreshTimeout = type === 'tvshow' ? 10000 : 3000;
  baseUrl = model.get('url').split('/').slice(0, -1).join('/');
  thumbs = Kodi.request("thumbsup:check", model);
  params.ignorenfo = config.getLocal('refreshIgnoreNFO', true);
  return Kodi.execute("ui:modal:confirm", tr('Are you sure?'), _.escape(t.sprintf(tr('Confirm refresh'), title)), function() {
    Backbone.fetchCache.clearItem(model);
    if (thumbs) {
      Kodi.request("thumbsup:toggle:entity", model);
    }
    return controller[method](model.get('id'), params, function(resp) {
      Kodi.execute("notification:show", tr("Refreshed media. Additional updates may still be occurring in the background"));
      return setTimeout(function() {
        var opts;
        if (title) {
          opts = {
            limits: {
              start: 0,
              end: 1
            },
            filter: {
              'operator': 'is',
              'field': 'title',
              'value': title
            },
            sort: {
              method: 'none',
              order: 'descending'
            },
            success: function(collection) {
              var newModel;
              if (collection.length) {
                newModel = collection.first();
                if (thumbs) {
                  Kodi.request("thumbsup:toggle:entity", newModel);
                }
                if (originalPath === helpers.url.path()) {
                  return Kodi.navigate(baseUrl + "/" + newModel.get('id'), {
                    trigger: true
                  });
                }
              } else {
                Kodi.execute("notification:show", tr("Refreshed media not found, redirecting to search"));
                return Kodi.navigate("search/" + type + "/" + title, {
                  trigger: true
                });
              }
            }
          };
          return Kodi.request(type + ":entities", opts);
        }
      }, refreshTimeout);
    });
  });
};


/*
  Our generic global helpers so we dont have add complexity to our app.
 */

helpers.global = {};

helpers.global.shuffle = function(array) {
  var i, j, temp;
  i = array.length - 1;
  while (i > 0) {
    j = Math.floor(Math.random() * (i + 1));
    temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    i--;
  }
  return array;
};

helpers.global.getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

helpers.global.time = function() {
  var timestamp;
  timestamp = new Date().getTime();
  return timestamp / 1000;
};

helpers.global.inArray = function(needle, haystack) {
  return _.indexOf(haystack, needle) > -1;
};

helpers.global.loading = (function(_this) {
  return function(state) {
    var op;
    if (state == null) {
      state = 'start';
    }
    op = state === 'start' ? 'add' : 'remove';
    if (_this.Kodi != null) {
      return _this.Kodi.execute("body:state", op, "loading");
    }
  };
})(this);

helpers.global.numPad = function(num, size) {
  var s;
  s = "000000000" + num;
  return s.substr(s.length - size);
};

helpers.global.secToTime = function(totalSec) {
  var hours, minutes, seconds;
  if (totalSec == null) {
    totalSec = 0;
  }
  totalSec = Math.round(totalSec);
  hours = parseInt(totalSec / 3600) % 24;
  minutes = parseInt(totalSec / 60) % 60;
  seconds = totalSec % 60;
  return {
    hours: hours,
    minutes: minutes,
    seconds: seconds
  };
};

helpers.global.timeToSec = function(time) {
  var hours, minutes;
  hours = parseInt(time.hours) * (60 * 60);
  minutes = parseInt(time.minutes) * 60;
  return parseInt(hours) + parseInt(minutes) + parseInt(time.seconds);
};

helpers.global.dateStringToObj = function(datetime) {
  if (!datetime) {
    return new Date(0);
  } else {
    return new Date(datetime.replace(" ", "t"));
  }
};

helpers.global.formatTime = function(time) {
  var hrStr;
  if (time == null) {
    return 0;
  } else {
    hrStr = "";
    if (time.hours > 0) {
      if (time.hours < 10) {
        hrStr = "0";
      }
      hrStr += time.hours + ':';
    }
    return hrStr + (time.minutes<10 ? '0' : '') + time.minutes + ':' + (time.seconds<10 ? '0' : '') + time.seconds;
  }
};

helpers.global.paramObj = function(key, value) {
  var obj;
  obj = {};
  obj[key] = value;
  return obj;
};

helpers.global.regExpEscape = function(str) {
  return str.replace(/([.?*+^$[\]\\(){}|-])/g, "\\$1");
};

helpers.global.stringStartsWith = function(start, data) {
  return new RegExp('^' + helpers.global.regExpEscape(start)).test(data);
};

helpers.global.stringStripStartsWith = function(start, data) {
  return data.substring(start.length);
};

helpers.global.arrayToSentence = function(arr, pluralise) {
  var i, item, last, prefix, str;
  if (pluralise == null) {
    pluralise = true;
  }
  str = '';
  prefix = pluralise ? 's' : '';
  last = arr.pop();
  if (arr.length > 0) {
    for (i in arr) {
      item = arr[i];
      str += '<strong>' + _.escape(item + prefix) + '</strong>';
      str += parseInt(i) !== (arr.length - 1) ? ', ' : '';
    }
    str += ' ' + t.gettext('and') + ' ';
  }
  return str += '<strong>' + _.escape(last + prefix) + '</strong>';
};

helpers.global.hashEncode = function(value) {
  return Base64.encode(value);
};

helpers.global.hashDecode = function(value) {
  return Base64.decode(value);
};

helpers.global.rating = function(rating) {
  return Math.round(rating * 10) / 10;
};

helpers.global.appTitle = function(playingItem) {
  var titlePrefix;
  if (playingItem == null) {
    playingItem = false;
  }
  titlePrefix = '';
  if (_.isObject(playingItem) && (playingItem.label != null)) {
    titlePrefix = '▶ ' + playingItem.label + ' | ';
  }
  return document.title = titlePrefix + config.get('static', 'appTitle');
};

helpers.global.localVideoPopup = function(path, height) {
  if (height == null) {
    height = 590;
  }
  return window.open(path, "_blank", "toolbar=no, scrollbars=no, resizable=yes, width=925, height=" + height + ", top=100, left=100");
};

helpers.global.stripTags = function(string) {
  if (string != null) {
    return string.replace(/(<([^>]+)>)/ig, "");
  } else {
    return '';
  }
};

helpers.global.round = function(x, places) {
  if (places == null) {
    places = 0;
  }
  return parseFloat(x.toFixed(places));
};

helpers.global.getPercent = function(pos, total, places) {
  if (places == null) {
    places = 2;
  }
  return Math.floor((pos / total) * (100 * Math.pow(10, places))) / 100;
};

helpers.global.saveFileText = function(content, filename) {
  var blob, error, error1, isFileSaverSupported;
  if (filename == null) {
    filename = 'untitled.txt';
  }
  try {
    isFileSaverSupported = !!new Blob;
    if (isFileSaverSupported) {
      content = content.replace(String.fromCharCode(65279), "");
      blob = new Blob([content], {
        type: "text/plain;charset=utf-8"
      });
      return saveAs(blob, filename, true);
    }
  } catch (error1) {
    error = error1;
    return Kodi.execute("notification:show", tr('Saving is not supported by your browser'));
  }
};

helpers.global.removeBBCode = function(string) {
  return string.replace(/\[\/?(?:b|i|u|s|left|center|right|quote|code|list|img|spoil|color).*?\]/ig, '');
};


/*
  A collection of small jquery plugin helpers.
 */

$.fn.removeClassRegex = function(regex) {
  return $(this).removeClass(function(index, classes) {
    return classes.split(/\s+/).filter(function(c) {
      return regex.test(c);
    }).join(' ');
  });
};

$.fn.removeClassStartsWith = function(startsWith) {
  return this.each(function(i, el) {
    var classes;
    classes = el.className.split(" ").filter(function(c) {
      return c.lastIndexOf(startsWith, 0) !== 0;
    });
    el.className = $.trim(classes.join(" "));
    return this;
  });
};

$.fn.scrollStopped = function(callback) {
  var $this, self;
  $this = $(this);
  self = this;
  return $this.scroll(function() {
    if ($this.data('scrollTimeout')) {
      clearTimeout($this.data('scrollTimeout'));
    }
    return $this.data('scrollTimeout', setTimeout(callback, 250, self));
  });
};

$.fn.resizeStopped = function(callback) {
  var $this, self;
  $this = $(this);
  self = this;
  return $this.resize(function() {
    if ($this.data('resizeTimeout')) {
      clearTimeout($this.data('resizeTimeout'));
    }
    return $this.data('resizeTimeout', setTimeout(callback, 250, self));
  });
};

$.fn.filterList = function(settings, callback) {
  var $this, defaults;
  $this = $(this);
  defaults = {
    hiddenClass: 'hidden',
    items: '.filter-options-list li',
    textSelector: '.option'
  };
  settings = $.extend(defaults, settings);
  return $this.on('keyup', (function(_this) {
    return function() {
      var $list, val;
      val = $this.val().toLocaleLowerCase();
      $list = $(settings.items).removeClass(settings.hiddenClass);
      if (val.length > 0) {
        $list.each(function(i, d) {
          var text;
          text = $(d).find(settings.textSelector).text().toLowerCase();
          if (text.indexOf(val) === -1) {
            return $(d).addClass(settings.hiddenClass);
          }
        });
      }
      if (typeof callback === "function") {
        return callback();
      }
    };
  })(this));
};

$(document).ready(function() {
  $('.dropdown li').on('click', function() {
    return $(this).closest('.dropdown').removeClass('open');
  });
  return $('.dropdown').on('click', function() {
    return $(this).removeClass('open').trigger('hide.bs.dropdown');
  });
});


/*
  Stream helpers
 */

helpers.stream = {};


/*
  Maps.
 */

helpers.stream.videoSizeMap = [
  {
    min: 0,
    max: 360,
    label: 'SD'
  }, {
    min: 361,
    max: 480,
    label: '480'
  }, {
    min: 481,
    max: 576,
    label: '576'
  }, {
    min: 577,
    max: 720,
    label: '720p'
  }, {
    min: 721,
    max: 1080,
    label: '1080p'
  }, {
    min: 1081,
    max: 100000,
    label: '4K'
  }
];

helpers.stream.audioChannelMap = [
  {
    channels: 6,
    label: '5.1'
  }, {
    channels: 8,
    label: '7.1'
  }, {
    channels: 2,
    label: '2.1'
  }, {
    channels: 1,
    label: 'mono'
  }
];

helpers.stream.langMap = {
  'eng': 'English',
  'und': 'Unknown',
  'bul': 'Bulgaria',
  'ara': 'Arabic',
  'zho': 'Chinese',
  'ces': 'Czech',
  'dan': 'Danish',
  'nld': 'Netherlands',
  'fin': 'Finish',
  'fra': 'French',
  'deu': 'German',
  'nor': 'Norwegian',
  'pol': 'Polish',
  'por': 'Portuguese',
  'ron': 'Romanian',
  'spa': 'Spanish',
  'swe': 'Swedish',
  'tur': 'Turkish',
  'vie': 'Vietnamese'
};


/*
  Formatters.
 */

helpers.stream.videoFormat = function(videoStreams) {
  var i, match, stream;
  for (i in videoStreams) {
    stream = videoStreams[i];
    match = {
      label: 'SD'
    };
    if (stream.height && stream.height > 0) {
      match = _.find(helpers.stream.videoSizeMap, function(res) {
        var ref;
        if ((res.min < (ref = stream.height) && ref <= res.max)) {
          return true;
        } else {
          return false;
        }
      });
    }
    videoStreams[i].label = stream.codec + ' ' + match.label + ' (' + stream.width + ' x ' + stream.height + ')';
    videoStreams[i].shortlabel = stream.codec + ' ' + match.label;
    videoStreams[i].res = match.label;
  }
  return videoStreams;
};

helpers.stream.formatLanguage = function(lang) {
  if (helpers.stream.langMap[lang]) {
    return helpers.stream.langMap[lang];
  } else {
    return lang;
  }
};

helpers.stream.audioFormat = function(audioStreams) {
  var ch, i, lang, stream;
  for (i in audioStreams) {
    stream = audioStreams[i];
    ch = _.findWhere(helpers.stream.audioChannelMap, {
      channels: stream.channels
    });
    ch = ch ? ch.label : stream.channels;
    lang = '';
    if (stream.language !== '') {
      lang = ' (' + helpers.stream.formatLanguage(stream.language) + ')';
    }
    audioStreams[i].label = stream.codec + ' ' + ch + lang;
    audioStreams[i].shortlabel = stream.codec + ' ' + ch;
    audioStreams[i].ch = ch;
  }
  return audioStreams;
};

helpers.stream.subtitleFormat = function(subtitleStreams) {
  var i, stream;
  for (i in subtitleStreams) {
    stream = subtitleStreams[i];
    subtitleStreams[i].label = helpers.stream.formatLanguage(stream.language);
    subtitleStreams[i].shortlabel = helpers.stream.formatLanguage(stream.language);
  }
  return subtitleStreams;
};

helpers.stream.streamFormat = function(streams) {
  var len, n, streamTypes, type;
  streamTypes = ['audio', 'video', 'subtitle'];
  for (n = 0, len = streamTypes.length; n < len; n++) {
    type = streamTypes[n];
    if (streams[type] && streams[type].length > 0) {
      streams[type] = helpers.stream[type + 'Format'](streams[type]);
    } else {
      streams[type] = [];
    }
  }
  return streams;
};


/*
  For everything translatable.
 */

helpers.translate = {};

helpers.translate.getLanguages = function() {
  return {
    en: "English",
    cs: "Czech",
    de: "German",
    es: "Spanish",
    fr: "French",
    hu: "Hungarian",
    lt: "Lithuanian",
    nl: "Dutch",
    pl: "Polish",
    pt: "Portuguese",
    zh_hans: "Chinese, Simplified"
  };
};

helpers.translate.init = function(callback) {
  var defaultLang, lang;
  defaultLang = config.get("static", "lang", "en");
  lang = config.preStartGet("lang", defaultLang);
  return $.getJSON("lang/_strings/" + lang + ".json", function(data) {
    window.t = new Jed(data);
    t.options["missing_key_callback"] = function(key) {
      return helpers.translate.missingKeyLog(key);
    };
    return callback();
  });
};

helpers.translate.missingKeyLog = function(key) {
  var item;
  item = '\n\n' + 'msgctxt ""\n' + 'msgid "' + key + '"\n' + 'msgstr "' + key + '"\n';
  return helpers.debug.msg(item, 'warning');
};


/*
  Translate aliases.
 */

tr = function(text) {
  return t.gettext(text);
};


/*
  UI helpers for the app.
 */

helpers.ui = {};

helpers.ui.bindOnScrollResize = function() {
  $(window).scrollStopped((function(_this) {
    return function() {
      return helpers.ui.requestTick();
    };
  })(this));
  return $(window).resizeStopped((function(_this) {
    return function() {
      return helpers.ui.requestTick();
    };
  })(this));
};

helpers.ui.isTicking = false;

helpers.ui.requestTick = function() {
  if (!helpers.ui.isTicking) {
    requestAnimationFrame((function(_this) {
      return function() {
        Kodi.vent.trigger("ui:animate:stop");
        return helpers.ui.isTicking = false;
      };
    })(this));
  }
  return helpers.ui.isTicking = true;
};

helpers.ui.getSwatch = function(imgSrc, callback) {
  var img, ret;
  ret = {};
  img = document.createElement('img');
  img.setAttribute('src', imgSrc);
  return img.addEventListener('load', function() {
    var sw, swatch, swatches, vibrant;
    vibrant = new Vibrant(img);
    swatches = vibrant.swatches();
    for (swatch in swatches) {
      if (swatches.hasOwnProperty(swatch) && swatches[swatch]) {
        sw = swatches[swatch];
        ret[swatch] = {
          hex: sw.getHex(),
          rgb: _.map(sw.getRgb(), function(c) {
            return Math.round(c);
          }),
          title: sw.getTitleTextColor(),
          body: sw.getBodyTextColor()
        };
      }
    }
    return callback(ret);
  });
};

helpers.ui.applyHeaderSwatch = function(swatches) {
  var $header, color, gradient, rgb;
  if ((swatches != null) && (swatches.DarkVibrant != null) && (swatches.DarkVibrant.hex != null)) {
    if (config.get('static', 'vibrantHeaders') === true) {
      color = swatches.DarkVibrant;
      $header = $('.details-header');
      $header.css('background-color', color.hex);
      rgb = color.rgb.join(',');
      gradient = 'linear-gradient(to right, ' + color.hex + ' 0%, rgba(' + rgb + ',0.9) 30%, rgba(' + rgb + ',0) 100%)';
      return $('.region-details-fanart .gradient', $header).css('background-image', gradient);
    }
  }
};


/*
  Handle urls.
 */

helpers.url = {};

helpers.url.map = {
  artist: 'music/artist/:id',
  album: 'music/album/:id',
  song: 'music/song/:id',
  movie: 'movie/:id',
  tvshow: 'tvshow/:id',
  season: 'tvshow/:id',
  episode: 'tvshow/:tvshowid/:season/:id',
  channeltv: 'pvr/tv/:id',
  channelradio: 'pvr/radio/:id',
  file: 'browser/file/:id',
  playlist: 'playlist/:id',
  musicvideo: 'music/video/:id'
};

helpers.url.baseKodiUrl = function(query) {
  var path;
  if (query == null) {
    query = 'Kodi';
  }
  path = (config.getLocal('jsonRpcEndpoint')) + "?" + query;
  if (config.getLocal('reverseProxy')) {
    return path;
  } else {
    return "/" + path;
  }
};

helpers.url.get = function(type, id, replacements) {
  var path, token;
  if (id == null) {
    id = '';
  }
  if (replacements == null) {
    replacements = {};
  }
  path = '';
  if (helpers.url.map[type] != null) {
    path = helpers.url.map[type];
  }
  replacements[':id'] = id;
  for (token in replacements) {
    id = replacements[token];
    path = path.replace(token, id);
  }
  return path;
};

helpers.url.filterLinks = function(entities, key, items, limit) {
  var baseUrl, i, item, links;
  if (limit == null) {
    limit = 5;
  }
  baseUrl = '#' + entities + '?' + key + '=';
  links = [];
  for (i in items) {
    item = items[i];
    if (i < limit) {
      links.push('<a href="' + baseUrl + encodeURIComponent(item) + '">' + item + '</a>');
    }
  }
  return links.join(', ');
};

helpers.url.playlistUrl = function(item) {
  if (item.type === 'song') {
    if (item.albumid !== '') {
      item.url = helpers.url.get('album', item.albumid);
    } else {
      item.url('music/albums');
    }
  }
  return item.url;
};

helpers.url.arg = function(arg) {
  var args, hash, hashParts;
  if (arg == null) {
    arg = 'none';
  }
  hash = location.hash;
  hashParts = hash.split('?');
  args = hashParts[0].substring(1).split('/');
  if (arg === 'none') {
    return args;
  } else if (args[arg] != null) {
    return args[arg];
  } else {
    return '';
  }
};

helpers.url.params = function(params) {
  var p, path, query, ref;
  if (params == null) {
    params = 'auto';
  }
  if (params === 'auto') {
    p = document.location.href;
    if (p.indexOf('?') === -1) {
      return {};
    } else {
      ref = p.split('?'), path = ref[0], query = ref[1];
    }
  }
  if (query == null) {
    query = params;
  }
  return _.object(_.compact(_.map(query.split('&'), function(item) {
    if (item) {
      return item.split('=');
    }
  })));
};

helpers.url.buildParams = function(params) {
  var key, q, val;
  q = [];
  for (key in params) {
    val = params[key];
    q.push(key + '=' + encodeURIComponent(val));
  }
  return '?' + q.join('&');
};

helpers.url.alterParams = function(add, remove) {
  var curParams, k, len, n, params;
  if (add == null) {
    add = {};
  }
  if (remove == null) {
    remove = [];
  }
  curParams = helpers.url.params();
  if (remove.length > 0) {
    for (n = 0, len = remove.length; n < len; n++) {
      k = remove[n];
      delete curParams[k];
    }
  }
  params = _.extend(curParams, add);
  return helpers.url.path() + helpers.url.buildParams(params);
};

helpers.url.path = function() {
  var p, path, query, ref;
  p = document.location.hash;
  ref = p.split('?'), path = ref[0], query = ref[1];
  return path.substring(1);
};

helpers.url.imdbUrl = function(imdbNumber, text) {
  var url;
  url = "http://www.imdb.com/title/" + imdbNumber + "/";
  return "<a href='" + url + "' class='imdblink' target='_blank'>" + (t.gettext(text)) + "</a>";
};

helpers.url.parseTrailerUrl = function(trailer) {
  var ret, urlParts;
  ret = {
    source: '',
    id: '',
    img: '',
    url: ''
  };
  urlParts = helpers.url.params(trailer);
  if (trailer.indexOf('youtube') > -1) {
    ret.source = 'youtube';
    ret.id = urlParts.videoid;
    ret.img = "http://img.youtube.com/vi/" + ret.id + "/0.jpg";
    ret.url = "https://www.youtube.com/watch?v=" + ret.id;
  }
  return ret;
};

helpers.url.isSecureProtocol = function() {
  var secure;
  secure = (typeof document !== "undefined" && document !== null) && document.location.protocol === "https:" ? true : false;
  return secure;
};

(function(Backbone) {
  var _sync, methods;
  _sync = Backbone.sync;
  Backbone.sync = function(method, entity, options) {
    var sync;
    if (options == null) {
      options = {};
    }
    _.defaults(options, {
      beforeSend: _.bind(methods.beforeSend, entity),
      complete: _.bind(methods.complete, entity)
    });
    sync = _sync(method, entity, options);
    if (!entity._fetch && method === "read") {
      return entity._fetch = sync;
    }
  };
  return methods = {
    beforeSend: function() {
      return this.trigger("sync:start", this);
    },
    complete: function() {
      return this.trigger("sync:stop", this);
    }
  };
})(Backbone);

(function(Backbone) {
  return _.extend(Backbone.Marionette.Application.prototype, {
    navigate: function(route, options) {
      if (options == null) {
        options = {};
      }
      return Backbone.history.navigate(route, options);
    },
    getCurrentRoute: function() {
      var frag;
      frag = Backbone.history.fragment;
      if (_.isEmpty(frag)) {
        return null;
      } else {
        return frag;
      }
    },
    startHistory: function() {
      if (Backbone.history) {
        return Backbone.history.start();
      }
    },
    register: function(instance, id) {
      if (this._registry == null) {
        this._registry = {};
      }
      return this._registry[id] = instance;
    },
    unregister: function(instance, id) {
      return delete this._registry[id];
    },
    resetRegistry: function() {
      var controller, key, msg, oldCount, ref;
      oldCount = this.getRegistrySize();
      ref = this._registry;
      for (key in ref) {
        controller = ref[key];
        controller.region.close();
      }
      msg = "There were " + oldCount + " controllers in the registry, there are now " + (this.getRegistrySize());
      if (this.getRegistrySize() > 0) {
        return console.warn(msg, this._registry);
      } else {
        return console.log(msg);
      }
    },
    getRegistrySize: function() {
      return _.size(this._registry);
    }
  });
})(Backbone);

(function(Marionette) {
  return _.extend(Marionette.Renderer, {
    extension: [".jst"],
    render: function(template, data) {
      var path;
      path = this.getTemplate(template);
      if (!path) {
        throw "Template " + template + " not found!";
      }
      return path(data);
    },
    getTemplate: function(template) {
      var path;
      path = this.insertAt(template.split("/"), -1, "tpl").join("/");
      path = path + this.extension;
      if (JST[path]) {
        return JST[path];
      }
    },
    insertAt: function(array, index, item) {
      array.splice(index, 0, item);
      return array;
    }
  });
})(Marionette);

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  return Entities.Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.getRawCollection = function() {
      var len, model, n, objs, ref;
      objs = [];
      if (this.models.length > 0) {
        ref = this.models;
        for (n = 0, len = ref.length; n < len; n++) {
          model = ref[n];
          objs.push(model.attributes);
        }
      }
      return objs;
    };

    Collection.prototype.getCacheKey = function(options) {
      var key;
      key = this.constructor.name;
      return key;
    };

    Collection.prototype.autoSort = function(params) {
      var order;
      if (params.sort) {
        order = params.order ? params.order : 'asc';
        return this.sortCollection(params.sort, order);
      }
    };

    Collection.prototype.sortCollection = function(property, order) {
      if (order == null) {
        order = 'asc';
      }
      if (property === 'random') {
        this.comparator = false;
        this.reset(this.shuffle(), {
          silent: true
        });
      } else {
        this.comparator = (function(_this) {
          return function(model) {
            return _this.ignoreArticleParse(model.get(property));
          };
        })(this);
        if (order === 'desc') {
          this.comparator = this.reverseSortBy(this.comparator);
        }
        this.sort();
      }
    };

    Collection.prototype.reverseSortBy = function(sortByFunction) {
      return function(left, right) {
        var l, r;
        l = sortByFunction(left);
        r = sortByFunction(right);
        if (l === void 0) {
          return -1;
        }
        if (r === void 0) {
          return 1;
        }
        if (l < r) {
          return 1;
        } else if (l > r) {
          return -1;
        } else {
          return 0;
        }
      };
    };

    Collection.prototype.ignoreArticleParse = function(string) {
      var articles, len, n, parsed, s;
      articles = ["'", '"', 'the ', 'a '];
      if (typeof string === 'string' && config.get('static', 'ignoreArticle', true)) {
        string = string.toLowerCase();
        parsed = false;
        for (n = 0, len = articles.length; n < len; n++) {
          s = articles[n];
          if (parsed) {
            continue;
          }
          if (helpers.global.stringStartsWith(s, string)) {
            string = helpers.global.stringStripStartsWith(s, string);
            parsed = true;
          }
        }
      }
      return string;
    };

    return Collection;

  })(Backbone.Collection);
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  return Entities.Filtered = (function(superClass) {
    extend(Filtered, superClass);

    function Filtered() {
      return Filtered.__super__.constructor.apply(this, arguments);
    }

    Filtered.prototype.filterByMultiple = function(key, values) {
      if (values == null) {
        values = [];
      }
      return this.filterBy(key, function(model) {
        return helpers.global.inArray(model.get(key), values);
      });
    };

    Filtered.prototype.filterByMultipleArray = function(key, values) {
      if (values == null) {
        values = [];
      }
      return this.filterBy(key, function(model) {
        var len, match, n, ref, v;
        match = false;
        ref = model.get(key);
        for (n = 0, len = ref.length; n < len; n++) {
          v = ref[n];
          if (helpers.global.inArray(v, values)) {
            match = true;
          }
        }
        return match;
      });
    };

    Filtered.prototype.filterByMultipleObject = function(key, property, values) {
      if (values == null) {
        values = [];
      }
      return this.filterBy(key, function(model) {
        var items, len, match, n, v;
        match = false;
        items = _.pluck(model.get(key), property);
        for (n = 0, len = items.length; n < len; n++) {
          v = items[n];
          if (helpers.global.inArray(v, values)) {
            match = true;
          }
        }
        return match;
      });
    };

    Filtered.prototype.filterByUnwatched = function() {
      return this.filterBy('unwatched', function(model) {
        var unwatched;
        unwatched = 1;
        if (model.get('type') === 'tvshow') {
          unwatched = model.get('episode') - model.get('watchedepisodes');
        } else if (model.get('type') === 'movie' || model.get('type') === 'episode') {
          unwatched = model.get('playcount') > 0 ? 0 : 1;
        }
        return unwatched > 0;
      });
    };

    Filtered.prototype.filterByThumbsUp = function(key) {
      return this.filterBy(key, function(model) {
        return App.request("thumbsup:check", model);
      });
    };

    Filtered.prototype.filterByInProgress = function(key) {
      return this.filterBy(key, function(model) {
        var inprogress;
        inprogress = model.get('progress') > 0 && model.get('progress') < 100 ? true : false;
        return inprogress;
      });
    };

    Filtered.prototype.filterByString = function(key, query) {
      return this.filterBy('search', function(model) {
        var value;
        if (query.length < 3) {
          return false;
        } else {
          value = model.get(key).toLowerCase();
          return value.indexOf(query.toLowerCase()) > -1;
        }
      });
    };

    return Filtered;

  })(FilteredCollection);
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  return Entities.Model = (function(superClass) {
    extend(Model, superClass);

    function Model() {
      this.saveError = bind(this.saveError, this);
      this.saveSuccess = bind(this.saveSuccess, this);
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.getCacheKey = function(options) {
      var key;
      key = this.constructor.name;
      return key;
    };

    Model.prototype.destroy = function(options) {
      if (options == null) {
        options = {};
      }
      _.defaults(options, {
        wait: true
      });
      this.set({
        _destroy: true
      });
      return Model.__super__.destroy.call(this, options);
    };

    Model.prototype.isDestroyed = function() {
      return this.get("_destroy");
    };

    Model.prototype.save = function(data, options) {
      var isNew;
      if (options == null) {
        options = {};
      }
      isNew = this.isNew();
      _.defaults(options, {
        wait: true,
        success: _.bind(this.saveSuccess, this, isNew, options.collection),
        error: _.bind(this.saveError, this)
      });
      this.unset("_errors");
      return Model.__super__.save.call(this, data, options);
    };

    Model.prototype.saveSuccess = function(isNew, collection) {
      if (isNew) {
        if (collection) {
          collection.add(this);
        }
        if (collection) {
          collection.trigger("model:created", this);
        }
        return this.trigger("created", this);
      } else {
        if (collection == null) {
          collection = this.collection;
        }
        if (collection) {
          collection.trigger("model:updated", this);
        }
        return this.trigger("updated", this);
      }
    };

    Model.prototype.saveError = function(model, xhr, options) {
      var ref;
      if (!(xhr.status === 500 || xhr.status === 404)) {
        return this.set({
          _errors: (ref = $.parseJSON(xhr.responseText)) != null ? ref.errors : void 0
        });
      }
    };

    return Model;

  })(Backbone.Model);
});


/*
  App configuration settings, items stored in local storage and are
  specific to the browser/user instance. Not Kodi settings.
 */

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    storageKey: 'config:app',
    getCollection: function() {
      var collection;
      collection = new Entities.ConfigAppCollection();
      collection.fetch();
      return collection;
    },
    getConfig: function(id, collection) {
      if (collection == null) {
        collection = API.getCollection();
      }
      return collection.find({
        id: id
      });
    }
  };
  Entities.ConfigApp = (function(superClass) {
    extend(ConfigApp, superClass);

    function ConfigApp() {
      return ConfigApp.__super__.constructor.apply(this, arguments);
    }

    ConfigApp.prototype.defaults = {
      data: {}
    };

    return ConfigApp;

  })(Entities.Model);
  Entities.ConfigAppCollection = (function(superClass) {
    extend(ConfigAppCollection, superClass);

    function ConfigAppCollection() {
      return ConfigAppCollection.__super__.constructor.apply(this, arguments);
    }

    ConfigAppCollection.prototype.model = Entities.ConfigApp;

    ConfigAppCollection.prototype.localStorage = new Backbone.LocalStorage(API.storageKey);

    return ConfigAppCollection;

  })(Entities.Collection);
  App.reqres.setHandler("config:app:get", function(configId, defaultData) {
    var model;
    model = API.getConfig(configId);
    if (model != null) {
      return model.get('data');
    } else {
      return defaultData;
    }
  });
  App.reqres.setHandler("config:app:set", function(configId, configData) {
    var collection, model;
    collection = API.getCollection();
    model = API.getConfig(configId, collection);
    if (model != null) {
      return model.save({
        data: configData
      });
    } else {
      collection.create({
        id: configId,
        data: configData
      });
      return configData;
    }
  });
  App.reqres.setHandler("config:static:get", function(configId, defaultData) {
    var data;
    data = config["static"][configId] != null ? config["static"][configId] : defaultData;
    return data;
  });
  return App.reqres.setHandler("config:static:set", function(configId, data) {
    config["static"][configId] = data;
    return data;
  });
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  Entities.ExternalEntity = (function(superClass) {
    extend(ExternalEntity, superClass);

    function ExternalEntity() {
      return ExternalEntity.__super__.constructor.apply(this, arguments);
    }

    ExternalEntity.prototype.defaults = {
      id: '',
      title: '',
      desc: '',
      thumbnail: '',
      url: '',
      type: '',
      provider: ''
    };

    return ExternalEntity;

  })(Entities.Model);
  return Entities.ExternalCollection = (function(superClass) {
    extend(ExternalCollection, superClass);

    function ExternalCollection() {
      return ExternalCollection.__super__.constructor.apply(this, arguments);
    }

    ExternalCollection.prototype.model = Entities.ExternalEntity;

    return ExternalCollection;

  })(Entities.Collection);
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    apiKey: 'ZWQ0Yjc4NGY5NzIyNzM1OGIzMWNhNGRkOTY2YTA0ZjE=',
    baseURL: 'http://webservice.fanart.tv/v3/',
    maxImageCount: 15,
    artistFieldTranslate: {
      artistbackground: 'fanart',
      artistthumb: 'thumbnail'
    },
    call: function(path, params, callback) {
      var defaultParams, req, url;
      defaultParams = {
        api_key: config.getAPIKey('apiKeyFanartTv', this.apiKey)
      };
      params = _.extend(defaultParams, params);
      url = this.baseURL + path + helpers.url.buildParams(params);
      req = $.getJSON(url, function(resp) {
        return callback(resp);
      });
      return req.fail(function(err) {
        return callback({
          status: 'error'
        });
      });
    },
    parseImageUrls: function(artType, collection) {
      var artTypes, field, i, item, items, ref, row, type;
      if (collection.status && collection.status === 'error') {
        return [];
      }
      items = [];
      artTypes = this[artType + 'FieldTranslate'];
      for (type in artTypes) {
        field = artTypes[type];
        if (collection[type] != null) {
          collection[type] = collection[type].slice(0, this.maxImageCount);
          ref = collection[type];
          for (i in ref) {
            item = ref[i];
            row = item;
            row.thumbnail = this.getThumbnailUrl(item.url);
            row.provider = 'fanarttv';
            row.type = field;
            items.push(row);
          }
        }
      }
      return items;
    },
    getThumbnailUrl: (function(_this) {
      return function(url) {
        return url.replace('assets.fanart.tv/', 'fanart.tv/detailpreview/');
      };
    })(this),
    images: function(type, id, callback) {
      return this.call(type + '/' + id, {}, (function(_this) {
        return function(resp) {
          return callback(_this.parseImageUrls('artist', resp));
        };
      })(this));
    },
    getMusicArtCollection: function(name, callback) {
      var cache, cacheKey;
      cacheKey = 'fanarttv:' + encodeURIComponent(name);
      cache = config.getLocal(cacheKey, []);
      if (cache.length > 0) {
        return API.createCollection(cache, callback);
      } else {
        return App.execute("musicbrainz:artist:entity", name, function(model) {
          if (model.get('id')) {
            return API.images('music', model.get('id'), function(results) {
              return API.createCollection(results, callback);
            });
          } else {
            return API.createCollection([], callback);
          }
        });
      }
    },
    createCollection: function(items, callback) {
      return callback(new Entities.ExternalCollection(items));
    }
  };
  return App.commands.setHandler("fanarttv:artist:image:entities", function(name, callback) {
    return API.getMusicArtCollection(name, callback);
  });
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    baseURL: 'http://musicbrainz.org/ws/2/',
    maxCount: 1,
    call: function(path, params, callback) {
      var url;
      url = this.baseURL + path + helpers.url.buildParams(params) + '&fmt=json';
      return $.getJSON(url, function(resp) {
        return callback(resp);
      });
    },
    findArtist: function(key, id, callback) {
      return this.call('artist/', {
        query: key + ':' + id
      }, function(resp) {
        var collection;
        collection = new Entities.ExternalCollection(API.parseArtist(resp));
        return callback(collection);
      });
    },
    parseArtist: function(resp) {
      var items;
      items = [];
      if (resp.artists && resp.artists.length) {
        items = resp.artists;
        items = _.map(items, function(item) {
          item.artistType = item.type;
          item.title = item.name;
          item.type = 'artist';
          item.provider = 'musicbrainz';
          return item;
        });
      }
      return items;
    }
  };
  return App.commands.setHandler("musicbrainz:artist:entity", function(name, callback) {
    return API.findArtist('artist', name, function(collection) {
      return callback(collection.first());
    });
  });
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    apiKey: 'NzFiYTFmMDdlZDBmYzhmYjM2MWNmMDRhNThkNzUwNTE=',
    baseURL: 'https://api.themoviedb.org/3/',
    baseImageURL: 'https://image.tmdb.org/t/p/',
    defaultLang: 'en',
    maxImageCount: 15,
    thumbSize: {
      backdrops: 'w300',
      posters: 'w185'
    },
    fieldTranslate: {
      backdrops: 'fanart',
      posters: 'thumbnail'
    },
    call: function(path, params, callback) {
      var defaultParams, url;
      defaultParams = {
        api_key: config.getAPIKey('apiKeyTMDB', this.apiKey)
      };
      params = _.extend(defaultParams, params);
      url = this.baseURL + path + helpers.url.buildParams(params) + '&callback=?';
      return $.getJSON(url, function(resp) {
        return callback(resp);
      });
    },
    getImageURL: function(path, size) {
      if (size == null) {
        size = 'original';
      }
      return this.baseImageURL + size + path;
    },
    parseImages: function(collection) {
      var field, i, item, items, ref, ref1, type;
      items = [];
      ref = API.fieldTranslate;
      for (type in ref) {
        field = ref[type];
        collection[type] = collection[type].slice(0, this.maxImageCount);
        ref1 = collection[type];
        for (i in ref1) {
          item = ref1[i];
          item.id = item.file_path;
          item.url = this.getImageURL(item.file_path, 'original');
          item.thumbnail = this.getImageURL(item.file_path, this.thumbSize[type]);
          item.type = field;
          item.provider = 'moviedb';
          items.push(item);
        }
      }
      return items;
    },
    find: function(id, source, callback) {
      if (source == null) {
        source = 'imdb_id';
      }
      return this.call('find/' + id, {
        external_source: source
      }, callback);
    },
    images: function(type, tmdbId, callback) {
      return this.call(type + '/' + tmdbId + '/images', {
        include_image_language: this.defaultLang + ',null'
      }, (function(_this) {
        return function(resp) {
          return callback(_this.parseImages(resp));
        };
      })(this));
    },
    getCollection: function(options, callback) {
      var cache, cacheKey, opts;
      opts = _.extend({
        lookupType: 'imdb_id',
        lookupId: '',
        type: 'movie'
      }, options);
      cacheKey = 'moviedb:' + JSON.stringify(opts);
      cache = config.getLocal(cacheKey, []);
      if (cache.length > 0) {
        return API.createCollection(cache, callback);
      } else {
        return API.find(opts.lookupId, opts.lookupType, function(resp) {
          var item, resKey;
          resKey = opts.type + '_results';
          if (resp[resKey] && resp[resKey].length > 0) {
            item = _.first(resp[resKey]);
            return API.images(opts.type, item.id, function(resp) {
              config.setLocal(cacheKey, resp);
              return API.createCollection(resp, callback);
            });
          } else {
            return API.createCollection([], callback);
          }
        });
      }
    },
    createCollection: function(items, callback) {
      return callback(new Entities.ExternalCollection(items));
    }
  };
  App.commands.setHandler("themoviedb:movie:image:entities", function(lookupId, callback) {
    var options;
    options = {
      lookupId: lookupId
    };
    return API.getCollection(options, callback);
  });
  return App.commands.setHandler("themoviedb:tv:image:entities", function(lookupId, callback) {
    var lookupType, options;
    lookupType = lookupId.lastIndexOf('tt', 0) === 0 ? 'imdb_id' : 'tvdb_id';
    options = {
      lookupId: lookupId,
      lookupType: lookupType,
      type: 'tv'
    };
    return API.getCollection(options, callback);
  });
});


/*
  Youtube collection
 */

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    apiKey: 'QUl6YVN5Qnh2YVI2bUNuVVdOOGN2MlRpUFJtdUVoMEZ5a0JUQUgw',
    searchUrl: 'https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&videoDefinition=any&videoEmbeddable=true&order=relevance&safeSearch=none',
    maxResults: 5,
    kodiUrl: 'plugin://plugin.video.youtube/?action=play_video&videoid=',
    ytURL: 'https://youtu.be/',
    getSearchUrl: function() {
      return this.searchUrl + '&key=' + config.getAPIKey('apiKeyYouTube', this.apiKey);
    },
    parseItems: function(response) {
      var enabled, i, item, items, ref, resp;
      items = [];
      enabled = App.request("addon:isEnabled", {
        addonid: 'plugin.video.youtube'
      }) ? true : false;
      ref = response.items;
      for (i in ref) {
        item = ref[i];
        resp = {
          id: item.id.videoId,
          title: item.snippet.title,
          label: item.snippet.title,
          desc: item.snippet.description,
          thumbnail: item.snippet.thumbnails.medium.url,
          url: API.ytURL + item.id.videoId,
          addonEnabled: enabled
        };
        items.push(resp);
      }
      return items;
    }
  };
  Entities.YouTubeCollection = (function(superClass) {
    extend(YouTubeCollection, superClass);

    function YouTubeCollection() {
      return YouTubeCollection.__super__.constructor.apply(this, arguments);
    }

    YouTubeCollection.prototype.model = Entities.ExternalEntity;

    YouTubeCollection.prototype.url = API.getSearchUrl();

    YouTubeCollection.prototype.sync = function(method, collection, options) {
      options.dataType = "jsonp";
      options.timeout = 5000;
      return Backbone.sync(method, collection, options);
    };

    YouTubeCollection.prototype.parse = function(resp) {
      return API.parseItems(resp);
    };

    return YouTubeCollection;

  })(Entities.ExternalCollection);
  App.commands.setHandler("youtube:search:entities", function(query, options, callback) {
    var data, yt;
    if (options == null) {
      options = {};
    }
    yt = new Entities.YouTubeCollection();
    data = _.extend({
      q: query,
      maxResults: API.maxResults
    }, options);
    return yt.fetch({
      data: data,
      success: function(collection) {
        return callback(collection);
      },
      error: function(collection) {
        return helpers.debug.log('Youtube search error', 'error', collection);
      }
    });
  });
  return App.commands.setHandler("youtube:trailer:entities", function(title, callback) {
    return App.execute("youtube:search:entities", title + ' trailer', {}, function(collection) {
      collection.map(function(item) {
        item.set({
          type: 'trailer',
          url: API.kodiUrl + item.id
        });
        return item;
      });
      return callback(collection);
    });
  });
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  Entities.Filter = (function(superClass) {
    extend(Filter, superClass);

    function Filter() {
      return Filter.__super__.constructor.apply(this, arguments);
    }

    Filter.prototype.defaults = {
      alias: '',
      type: 'string',
      key: '',
      sortOrder: 'asc',
      title: '',
      active: false
    };

    return Filter;

  })(Entities.Model);
  Entities.FilterCollection = (function(superClass) {
    extend(FilterCollection, superClass);

    function FilterCollection() {
      return FilterCollection.__super__.constructor.apply(this, arguments);
    }

    FilterCollection.prototype.model = Entities.Filter;

    return FilterCollection;

  })(Entities.Collection);
  Entities.FilterOption = (function(superClass) {
    extend(FilterOption, superClass);

    function FilterOption() {
      return FilterOption.__super__.constructor.apply(this, arguments);
    }

    FilterOption.prototype.defaults = {
      key: '',
      value: '',
      title: ''
    };

    return FilterOption;

  })(Entities.Model);
  Entities.FilterOptionCollection = (function(superClass) {
    extend(FilterOptionCollection, superClass);

    function FilterOptionCollection() {
      return FilterOptionCollection.__super__.constructor.apply(this, arguments);
    }

    FilterOptionCollection.prototype.model = Entities.Filter;

    return FilterOptionCollection;

  })(Entities.Collection);
  Entities.FilterSort = (function(superClass) {
    extend(FilterSort, superClass);

    function FilterSort() {
      return FilterSort.__super__.constructor.apply(this, arguments);
    }

    FilterSort.prototype.defaults = {
      alias: '',
      type: 'string',
      defaultSort: false,
      defaultOrder: 'asc',
      key: '',
      active: false,
      order: 'asc',
      title: ''
    };

    return FilterSort;

  })(Entities.Model);
  Entities.FilterSortCollection = (function(superClass) {
    extend(FilterSortCollection, superClass);

    function FilterSortCollection() {
      return FilterSortCollection.__super__.constructor.apply(this, arguments);
    }

    FilterSortCollection.prototype.model = Entities.FilterSort;

    return FilterSortCollection;

  })(Entities.Collection);
  Entities.FilterActive = (function(superClass) {
    extend(FilterActive, superClass);

    function FilterActive() {
      return FilterActive.__super__.constructor.apply(this, arguments);
    }

    FilterActive.prototype.defaults = {
      key: '',
      values: [],
      title: ''
    };

    return FilterActive;

  })(Entities.Model);
  Entities.FilterActiveCollection = (function(superClass) {
    extend(FilterActiveCollection, superClass);

    function FilterActiveCollection() {
      return FilterActiveCollection.__super__.constructor.apply(this, arguments);
    }

    FilterActiveCollection.prototype.model = Entities.FilterActive;

    return FilterActiveCollection;

  })(Entities.Collection);
  App.reqres.setHandler('filter:filters:entities', function(collection) {
    return new Entities.FilterCollection(collection);
  });
  App.reqres.setHandler('filter:filters:options:entities', function(collection) {
    return new Entities.FilterOptionCollection(collection);
  });
  App.reqres.setHandler('filter:sort:entities', function(collection) {
    return new Entities.FilterSortCollection(collection);
  });
  return App.reqres.setHandler('filter:active:entities', function(collection) {
    return new Entities.FilterActiveCollection(collection);
  });
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  var API;
  Entities.FormItem = (function(superClass) {
    extend(FormItem, superClass);

    function FormItem() {
      return FormItem.__super__.constructor.apply(this, arguments);
    }

    FormItem.prototype.defaults = {
      id: 0,
      title: '',
      type: '',
      element: '',
      options: [],
      defaultValue: '',
      description: '',
      children: [],
      attributes: {},
      "class": '',
      suffix: '',
      prefix: '',
      formState: {}
    };

    return FormItem;

  })(Entities.Model);
  Entities.Form = (function(superClass) {
    extend(Form, superClass);

    function Form() {
      return Form.__super__.constructor.apply(this, arguments);
    }

    Form.prototype.model = Entities.FormItem;

    return Form;

  })(Entities.Collection);
  API = {
    applyState: function(item, formState) {
      var property;
      item.formState = formState;
      item.defaultValue = item.defaultValue ? item.defaultValue : '';
      property = item.valueProperty ? item.valueProperty : item.id;
      if (formState[property] != null) {
        item.defaultValue = this.formatDefaultValue(item.format, formState[property]);
        item.defaultsApplied = true;
      }
      return item;
    },
    formatDefaultValue: function(format, value) {
      if (format === 'array.string' || format === 'array.integer') {
        return value.join('; ');
      } else if (format === 'integer' && value !== '') {
        return parseInt(value);
      } else {
        return value;
      }
    },
    formatSubmittedValues: function(item, values) {
      if (item.format && (values[item.id] != null)) {
        if (item.format === 'array.string') {
          values[item.id] = values[item.id] !== '' ? _.map(values[item.id].split(';'), function(v) {
            return v.trim();
          }) : [];
        } else if (item.format === 'array.integer') {
          values[item.id] = values[item.id] !== '' ? _.map(values[item.id].split(';'), function(v) {
            return parseInt(v.trim());
          }) : [];
        } else if (item.format === 'integer') {
          values[item.id] = parseInt(values[item.id]);
        } else if (item.format === 'float') {
          values[item.id] = parseFloat(values[item.id]);
        } else if (item.format === 'prevent.submit') {
          delete values[item.id];
        }
      }
      return values;
    },
    processItems: function(items, formState, isChild) {
      var collection, item, len, n;
      if (formState == null) {
        formState = {};
      }
      if (isChild == null) {
        isChild = false;
      }
      collection = [];
      for (n = 0, len = items.length; n < len; n++) {
        item = items[n];
        item = this.applyState(item, formState);
        if (item.children && item.children.length > 0) {
          item.children = API.processItems(item.children, formState, true);
        }
        collection.push(item);
      }
      return collection;
    },
    processSubmitted: function(items, formState, isChild) {
      var item, len, n;
      if (formState == null) {
        formState = {};
      }
      if (isChild == null) {
        isChild = false;
      }
      for (n = 0, len = items.length; n < len; n++) {
        item = items[n];
        formState = this.formatSubmittedValues(item, formState);
        if (item.children && item.children.length > 0) {
          formState = API.processSubmitted(item.children.toJSON(), formState, true);
        }
      }
      return formState;
    },
    toCollection: function(items) {
      var childCollection, i, item;
      for (i in items) {
        item = items[i];
        if (item.children && item.children.length > 0) {
          childCollection = new Entities.Form(item.children);
          items[i].children = childCollection;
        }
      }
      return new Entities.Form(items);
    }
  };
  App.reqres.setHandler("form:item:entities", function(form, formState) {
    if (form == null) {
      form = [];
    }
    if (formState == null) {
      formState = {};
    }
    return API.toCollection(API.processItems(form, formState));
  });
  return App.reqres.setHandler("form:value:entities", function(form, formState) {
    if (form == null) {
      form = [];
    }
    if (formState == null) {
      formState = {};
    }
    return API.processSubmitted(form, formState);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    cacheSynced: function(entities, callback) {
      return entities.on('cachesync', function() {
        callback();
        return helpers.global.loading("end");
      });
    },
    xhrsFetch: function(entities, callback) {
      var xhrs;
      xhrs = _.chain([entities]).flatten().pluck("_fetch").value();
      return $.when.apply($, xhrs).done(function() {
        callback();
        return helpers.global.loading("end");
      });
    }
  };
  return App.commands.setHandler("when:entity:fetched", function(entities, callback) {
    helpers.global.loading("start");
    if (!entities.params) {
      return API.cacheSynced(entities, callback);
    } else {
      return API.xhrsFetch(entities, callback);
    }
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {
  Backbone.fetchCache.localStorage = false;
  return KodiEntities.Collection = (function(superClass) {
    extend(Collection, superClass);

    function Collection() {
      return Collection.__super__.constructor.apply(this, arguments);
    }

    Collection.prototype.url = function() {
      return helpers.url.baseKodiUrl(this.constructor.name);
    };

    Collection.prototype.rpc = new Backbone.Rpc({
      namespaceDelimiter: ''
    });

    Collection.prototype.sync = function(method, model, options) {
      if (method === 'read') {
        this.options = options;
      }
      return Backbone.sync(method, model, options);
    };

    Collection.prototype.getCacheKey = function(options) {
      var k, key, len, n, prop, ref, ref1, val;
      this.options = options;
      key = this.constructor.name;
      ref = ['filter', 'sort', 'limit', 'file'];
      for (n = 0, len = ref.length; n < len; n++) {
        k = ref[n];
        if (options[k]) {
          ref1 = options[k];
          for (prop in ref1) {
            val = ref1[prop];
            key += ':' + prop + ':' + val;
          }
        }
      }
      return key;
    };

    Collection.prototype.getResult = function(response, key) {
      var result;
      this.responseKey = key;
      result = response.jsonrpc && response.result ? response.result : response;
      return result[key];
    };

    Collection.prototype.argCheckOption = function(option, fallback) {
      if ((this.options != null) && (this.options[option] != null)) {
        return this.options[option];
      } else {
        return fallback;
      }
    };

    Collection.prototype.argSort = function(method, order) {
      var arg;
      if (order == null) {
        order = 'ascending';
      }
      arg = {
        method: method,
        order: order,
        ignorearticle: this.isIgnoreArticle()
      };
      return this.argCheckOption('sort', arg);
    };

    Collection.prototype.argLimit = function(start, end) {
      var arg;
      if (start == null) {
        start = 0;
      }
      if (end == null) {
        end = 'all';
      }
      arg = {
        start: start
      };
      if (end !== 'all') {
        arg.end = end;
      }
      return this.argCheckOption('limit', arg);
    };

    Collection.prototype.argFilter = function(name, value) {
      var arg;
      arg = {};
      if (name != null) {
        arg[name] = value;
      } else {
        arg = void 0;
      }
      return this.argCheckOption('filter', arg);
    };

    Collection.prototype.argFields = function(fields) {
      var field, len, n, ref;
      if ((this.options != null) && (this.options.fields != null)) {
        fields = this.options.fields;
      }
      if ((this.options != null) && (this.options.addFields != null)) {
        ref = this.options.addFields;
        for (n = 0, len = ref.length; n < len; n++) {
          field = ref[n];
          if (!helpers.global.inArray(field, fields)) {
            fields.push(field);
          }
        }
      }
      return fields;
    };

    Collection.prototype.isIgnoreArticle = function() {
      return config.getLocal('ignoreArticle', true);
    };

    Collection.prototype.getArgs = function(defaults) {
      var args;
      args = this.options != null ? _.extend(defaults, this.options) : defaults;
      return args;
    };

    return Collection;

  })(App.Entities.Collection);
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {
  return KodiEntities.Model = (function(superClass) {
    extend(Model, superClass);

    function Model() {
      return Model.__super__.constructor.apply(this, arguments);
    }

    Model.prototype.initialize = function() {
      if (this.methods) {
        return App.vent.on('entity:kodi:update', (function(_this) {
          return function(uid) {
            var fields;
            if (_this.get('uid') === uid) {
              fields = App.request(_this.get('type') + ":fields");
              if (fields && fields.length > 0) {
                return _this.fetch({
                  properties: fields,
                  success: function(updatedModel) {
                    return Backbone.fetchCache.clearItem(updatedModel);
                  }
                });
              }
            }
          };
        })(this));
      }
    };

    Model.prototype.url = function() {
      return helpers.url.baseKodiUrl(this.constructor.name);
    };

    Model.prototype.rpc = new Backbone.Rpc({
      useNamedParameters: true,
      namespaceDelimiter: ''
    });

    Model.prototype.modelDefaults = {
      fullyloaded: false,
      thumbnail: '',
      thumbsUp: 0,
      parsed: false,
      progress: 0
    };

    Model.prototype.parseModel = function(type, model, id) {
      if (!model.parsed) {
        if (id !== 'mixed') {
          model.id = id;
        }
        if (model.rating) {
          model.rating = helpers.global.rating(model.rating);
        }
        if (model.streamdetails && _.isObject(model.streamdetails)) {
          model.streamdetails = helpers.stream.streamFormat(model.streamdetails);
        }
        if (model.resume) {
          model.progress = model.resume.position === 0 ? 0 : Math.round((model.resume.position / model.resume.total) * 100);
        }
        if (model.trailer) {
          model.mediaTrailer = helpers.url.parseTrailerUrl(model.trailer);
        }
        if (model.starttime) {
          model.start = helpers.global.dateStringToObj(model.starttime);
        }
        if (model.endtime) {
          model.end = helpers.global.dateStringToObj(model.endtime);
        }
        if (type === 'tvshow' || type === 'season') {
          model.progress = helpers.global.round((model.watchedepisodes / model.episode) * 100, 2);
        }
        if (type === 'episode' || type === 'movie' && model.progress === 0) {
          model.progress = model.playcount === 0 ? 0 : 100;
        }
        if (type === 'album' || type === 'artist') {
          model.progress = 0;
        }
        if (type === 'episode') {
          model.url = helpers.url.get(type, id, {
            ':tvshowid': model.tvshowid,
            ':season': model.season
          });
        } else if (type === 'channel') {
          if (model.channeltype === 'tv') {
            type = "channeltv";
          } else {
            type = "channelradio";
          }
          model.url = helpers.url.get(type, id);
        } else {
          model.url = helpers.url.get(type, id);
        }
        model = App.request("images:path:entity", model);
        model.type = type;
        model.uid = helpers.entities.createUid(model, type);
        model.parsed = true;
      }
      return model;
    };

    Model.prototype.parseFieldsToDefaults = function(fields, defaults) {
      var field, len, n;
      if (defaults == null) {
        defaults = {};
      }
      for (n = 0, len = fields.length; n < len; n++) {
        field = fields[n];
        defaults[field] = '';
      }
      return defaults;
    };

    Model.prototype.checkResponse = function(response, checkKey) {
      var obj;
      obj = response[checkKey] != null ? response[checkKey] : response;
      if (response[checkKey] != null) {
        obj.fullyloaded = true;
      }
      return obj;
    };

    return Model;

  })(App.Entities.Model);
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    availableProviders: ['video', 'audio', 'executable'],
    fields: {
      minimal: ['addonid', 'name', 'type', 'thumbnail', 'label'],
      small: ['author', 'broken', 'description', 'version', 'enabled', 'extrainfo', 'summary'],
      full: ['fanart', 'path']
    },
    getCollection: function(type, callback) {
      var addonController;
      addonController = App.request("command:kodi:controller", 'auto', 'AddOn');
      return addonController.getEnabledAddons(true, function(addons) {
        var collection;
        collection = new KodiEntities.AddonCollection(API.parseAddons(addons, type));
        return callback(collection);
      });
    },
    parseAddons: function(addons, type) {
      var addon, extra, i, len, n, ref, ret;
      ret = [];
      for (i in addons) {
        addon = addons[i];
        addon.provides = [];
        addon.label = addon.name;
        addon = App.request("images:path:entity", addon);
        ref = addon.extrainfo;
        for (n = 0, len = ref.length; n < len; n++) {
          extra = ref[n];
          if (_.isObject(extra) && extra.key === 'provides' && extra.value && helpers.global.inArray(extra.value, API.availableProviders)) {
            addon.provides.push(extra.value);
          }
        }
        if (addon.provides.length > 0 && (helpers.global.inArray(type, addon.provides) || type === 'all')) {
          addon.providesDefault = _.first(addon.provides);
          addon.subtitle = tr(addon.providesDefault);
          ret.push(API.parsePath(addon));
        }
      }
      return ret;
    },
    parsePath: function(addon) {
      var media;
      if (helpers.global.inArray('executable', addon.provides)) {
        addon.url = 'addon/execute/' + addon.addonid;
      } else {
        media = addon.providesDefault.replace('audio', 'music');
        addon.url = 'browser/' + media + '/' + encodeURIComponent('plugin://' + addon.addonid + '/');
      }
      return addon;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Addon = (function(superClass) {
    extend(Addon, superClass);

    function Addon() {
      return Addon.__super__.constructor.apply(this, arguments);
    }

    Addon.prototype.idAttribute = "addonid";

    Addon.prototype.defaults = function() {
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), {});
    };

    return Addon;

  })(App.KodiEntities.Model);
  KodiEntities.AddonCollection = (function(superClass) {
    extend(AddonCollection, superClass);

    function AddonCollection() {
      return AddonCollection.__super__.constructor.apply(this, arguments);
    }

    AddonCollection.prototype.model = KodiEntities.Addon;

    return AddonCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  return App.reqres.setHandler("addon:entities", function(type, callback) {
    if (type == null) {
      type = 'all';
    }
    return API.getCollection(type, callback);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    fields: {
      minimal: ['thumbnail'],
      small: ['playcount', 'artistid', 'artist', 'genre', 'albumlabel', 'year', 'dateadded', 'style'],
      full: ['fanart', 'mood', 'description', 'rating', 'type', 'theme']
    },
    getAlbum: function(id, options) {
      var album;
      album = new App.KodiEntities.Album();
      album.set({
        albumid: parseInt(id),
        properties: helpers.entities.getFields(API.fields, 'full')
      });
      album.fetch(options);
      return album;
    },
    getAlbums: function(options) {
      var collection;
      collection = new KodiEntities.AlbumCollection();
      collection.fetch(helpers.entities.buildOptions(options));
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Album = (function(superClass) {
    extend(Album, superClass);

    function Album() {
      return Album.__super__.constructor.apply(this, arguments);
    }

    Album.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        albumid: 1,
        album: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    Album.prototype.methods = {
      read: ['AudioLibrary.GetAlbumDetails', 'albumid', 'properties']
    };

    Album.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.albumdetails != null ? resp.albumdetails : resp;
      obj.title = obj.label;
      if (resp.albumdetails != null) {
        obj.fullyloaded = true;
      }
      return this.parseModel('album', obj, obj.albumid);
    };

    return Album;

  })(App.KodiEntities.Model);
  KodiEntities.AlbumCollection = (function(superClass) {
    extend(AlbumCollection, superClass);

    function AlbumCollection() {
      return AlbumCollection.__super__.constructor.apply(this, arguments);
    }

    AlbumCollection.prototype.model = KodiEntities.Album;

    AlbumCollection.prototype.methods = {
      read: ['AudioLibrary.GetAlbums', 'properties', 'limits', 'sort', 'filter']
    };

    AlbumCollection.prototype.args = function() {
      return this.getArgs({
        properties: this.argFields(helpers.entities.getFields(API.fields, 'small')),
        limits: this.argLimit(),
        sort: this.argSort('title', 'ascending'),
        filter: this.argFilter()
      });
    };

    AlbumCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'albums');
    };

    return AlbumCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("album:entity", function(id, options) {
    if (options == null) {
      options = {};
    }
    return API.getAlbum(id, options);
  });
  App.reqres.setHandler("album:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getAlbums(options);
  });
  return App.reqres.setHandler("album:fields", function(type) {
    if (type == null) {
      type = 'full';
    }
    return helpers.entities.getFields(API.fields, type);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    fields: {
      minimal: [],
      small: ['thumbnail', 'mood', 'genre', 'style'],
      full: ['fanart', 'born', 'formed', 'description', 'died', 'disbanded', 'yearsactive', 'instrument', 'musicbrainzartistid']
    },
    getArtist: function(id, options) {
      var artist;
      artist = new App.KodiEntities.Artist();
      artist.set({
        artistid: parseInt(id),
        properties: helpers.entities.getFields(API.fields, 'full')
      });
      artist.fetch(options);
      return artist;
    },
    getArtists: function(options) {
      var collection;
      collection = new KodiEntities.ArtistCollection();
      collection.fetch(helpers.entities.buildOptions(options));
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Artist = (function(superClass) {
    extend(Artist, superClass);

    function Artist() {
      return Artist.__super__.constructor.apply(this, arguments);
    }

    Artist.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        artistid: 1,
        artist: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    Artist.prototype.methods = {
      read: ['AudioLibrary.GetArtistDetails', 'artistid', 'properties']
    };

    Artist.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.artistdetails != null ? resp.artistdetails : resp;
      if (resp.artistdetails != null) {
        obj.fullyloaded = true;
      }
      return this.parseModel('artist', obj, obj.artistid);
    };

    return Artist;

  })(App.KodiEntities.Model);
  KodiEntities.ArtistCollection = (function(superClass) {
    extend(ArtistCollection, superClass);

    function ArtistCollection() {
      return ArtistCollection.__super__.constructor.apply(this, arguments);
    }

    ArtistCollection.prototype.model = KodiEntities.Artist;

    ArtistCollection.prototype.methods = {
      read: ['AudioLibrary.GetArtists', 'albumartistsonly', 'properties', 'limits', 'sort', 'filter']
    };

    ArtistCollection.prototype.args = function() {
      return this.getArgs({
        albumartistsonly: config.getLocal('albumArtistsOnly', true),
        properties: this.argFields(helpers.entities.getFields(API.fields, 'small')),
        limits: this.argLimit(),
        sort: this.argSort('title', 'ascending'),
        filter: this.argFilter()
      });
    };

    ArtistCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'artists');
    };

    return ArtistCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("artist:entity", function(id, options) {
    if (options == null) {
      options = {};
    }
    return API.getArtist(id, options);
  });
  App.reqres.setHandler("artist:entities", function(options) {
    if (options == null) {
      options = {};
    }
    if (options.filter && options.albumartistsonly !== true) {
      options.albumartistsonly = false;
    }
    return API.getArtists(options);
  });
  return App.reqres.setHandler("artist:fields", function(type) {
    if (type == null) {
      type = 'full';
    }
    return helpers.entities.getFields(API.fields, type);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fields: {
      minimal: ['name'],
      small: ['order', 'role', 'thumbnail', 'origin', 'url'],
      full: []
    },
    getCollection: function(cast, origin) {
      var collection, i, item;
      for (i in cast) {
        item = cast[i];
        cast[i].origin = origin;
      }
      collection = new KodiEntities.CastCollection(cast);
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Cast = (function(superClass) {
    extend(Cast, superClass);

    function Cast() {
      return Cast.__super__.constructor.apply(this, arguments);
    }

    Cast.prototype.idAttribute = "order";

    Cast.prototype.defaults = function() {
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'small'), {});
    };

    Cast.prototype.parse = function(obj, xhr) {
      obj.url = '?cast=' + obj.name;
      return obj;
    };

    return Cast;

  })(App.KodiEntities.Model);
  KodiEntities.CastCollection = (function(superClass) {
    extend(CastCollection, superClass);

    function CastCollection() {
      return CastCollection.__super__.constructor.apply(this, arguments);
    }

    CastCollection.prototype.model = KodiEntities.Cast;

    return CastCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  return App.reqres.setHandler("cast:entities", function(cast, origin) {
    return API.getCollection(cast, origin);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fields: {
      minimal: [],
      small: ['title', 'runtime', 'starttime', 'endtime', 'genre', 'progress'],
      full: ["plot", "plotoutline", "progresspercentage", "episodename", "episodenum", "episodepart", "firstaired", "hastimer", "isactive", "parentalrating", "wasactive", "thumbnail", "rating", "originaltitle", "cast", "director", "writer", "year", "imdbnumber", "hastimerrule", "hasrecording", "recording", "isseries"]
    },
    getEntity: function(channelid, options) {
      var entity;
      entity = new App.KodiEntities.Broadcast();
      entity.set({
        channelid: parseInt(channelid),
        properties: helpers.entities.getFields(API.fields, 'full')
      });
      entity.fetch(options);
      return entity;
    },
    getCollection: function(options) {
      var collection, defaultOptions;
      defaultOptions = {
        useNamedParameters: true
      };
      options = _.extend(defaultOptions, options);
      collection = new KodiEntities.BroadcastCollection();
      collection.fetch(options);
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Broadcast = (function(superClass) {
    extend(Broadcast, superClass);

    function Broadcast() {
      return Broadcast.__super__.constructor.apply(this, arguments);
    }

    Broadcast.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        channelid: 1,
        channel: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    Broadcast.prototype.methods = {
      read: ['PVR.GetBroadcasts', 'channelid', 'properties']
    };

    Broadcast.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.broadcasts != null ? resp.broadcasts : resp;
      if (resp.broadcasts != null) {
        obj.fullyloaded = true;
      }
      return this.parseModel('broadcast', obj, obj.broadcastid);
    };

    return Broadcast;

  })(App.KodiEntities.Model);
  KodiEntities.BroadcastCollection = (function(superClass) {
    extend(BroadcastCollection, superClass);

    function BroadcastCollection() {
      return BroadcastCollection.__super__.constructor.apply(this, arguments);
    }

    BroadcastCollection.prototype.model = KodiEntities.Broadcast;

    BroadcastCollection.prototype.methods = {
      read: ['PVR.GetBroadcasts', 'channelid', 'properties', 'limits']
    };

    BroadcastCollection.prototype.args = function() {
      return this.getArgs({
        channelid: this.argCheckOption('channelid', 0),
        properties: helpers.entities.getFields(API.fields, 'full'),
        limits: this.argLimit()
      });
    };

    BroadcastCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'broadcasts');
    };

    return BroadcastCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("broadcast:entity", function(collection, channelid) {
    return API.getEntity(collection, parseInt(channelid));
  });
  return App.reqres.setHandler("broadcast:entities", function(channelid, options) {
    if (options == null) {
      options = {};
    }
    options.channelid = parseInt(channelid);
    return API.getCollection(options);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fields: {
      minimal: ['title'],
      small: ['thumbnail', 'playcount', 'lastplayed', 'dateadded', 'episode', 'season', 'rating', 'file', 'cast', 'showtitle', 'tvshowid', 'uniqueid', 'resume', 'firstaired'],
      full: ['fanart', 'plot', 'director', 'writer', 'runtime', 'streamdetails']
    },
    getEntity: function(id, options) {
      var entity;
      entity = new App.KodiEntities.Episode();
      entity.set({
        episodeid: parseInt(id),
        properties: helpers.entities.getFields(API.fields, 'full')
      });
      entity.fetch(options);
      return entity;
    },
    getCollection: function(options) {
      var collection, defaultOptions;
      defaultOptions = {
        cache: false,
        expires: config.get('static', 'collectionCacheExpiry'),
        useNamedParameters: true
      };
      options = _.extend(defaultOptions, options);
      collection = new KodiEntities.EpisodeCollection();
      collection.fetch(options);
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Episode = (function(superClass) {
    extend(Episode, superClass);

    function Episode() {
      return Episode.__super__.constructor.apply(this, arguments);
    }

    Episode.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        episodeid: 1,
        episode: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    Episode.prototype.methods = {
      read: ['VideoLibrary.GetEpisodeDetails', 'episodeid', 'properties']
    };

    Episode.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.episodedetails != null ? resp.episodedetails : resp;
      if (resp.episodedetails != null) {
        obj.fullyloaded = true;
      }
      obj.unwatched = obj.playcount > 0 ? 0 : 1;
      return this.parseModel('episode', obj, obj.episodeid);
    };

    return Episode;

  })(App.KodiEntities.Model);
  KodiEntities.EpisodeCollection = (function(superClass) {
    extend(EpisodeCollection, superClass);

    function EpisodeCollection() {
      return EpisodeCollection.__super__.constructor.apply(this, arguments);
    }

    EpisodeCollection.prototype.model = KodiEntities.Episode;

    EpisodeCollection.prototype.methods = {
      read: ['VideoLibrary.GetEpisodes', 'tvshowid', 'season', 'properties', 'limits', 'sort', 'filter']
    };

    EpisodeCollection.prototype.args = function() {
      return this.getArgs({
        tvshowid: this.argCheckOption('tvshowid', void 0),
        season: this.argCheckOption('season', void 0),
        properties: this.argFields(helpers.entities.getFields(API.fields, 'small')),
        limits: this.argLimit(),
        sort: this.argSort("episode", "ascending"),
        filter: this.argCheckOption('filter', void 0)
      });
    };

    EpisodeCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'episodes');
    };

    return EpisodeCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.EpisodeCustomCollection = (function(superClass) {
    extend(EpisodeCustomCollection, superClass);

    function EpisodeCustomCollection() {
      return EpisodeCustomCollection.__super__.constructor.apply(this, arguments);
    }

    EpisodeCustomCollection.prototype.model = KodiEntities.Episode;

    return EpisodeCustomCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("episode:entity", function(id, options) {
    if (options == null) {
      options = {};
    }
    return API.getEntity(id, options);
  });
  App.reqres.setHandler("episode:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getCollection(options);
  });
  App.reqres.setHandler("episode:tvshow:entities", function(tvshowid, season, options) {
    if (options == null) {
      options = {};
    }
    if (tvshowid !== 'all') {
      options.tvshowid = tvshowid;
      if (season !== 'all') {
        options.season = season;
      }
    }
    return API.getCollection(options);
  });
  App.reqres.setHandler("episode:build:collection", function(items) {
    return new KodiEntities.EpisodeCustomCollection(items);
  });
  return App.reqres.setHandler("episode:fields", function(type) {
    if (type == null) {
      type = 'full';
    }
    return helpers.entities.getFields(API.fields, type);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fields: {
      minimal: ['title', 'file', 'mimetype'],
      small: ['thumbnail', 'dateadded'],
      full: ['fanart', 'streamdetails']
    },
    addonFields: ['path', 'name'],
    sources: [
      {
        media: 'video',
        label: 'Video',
        type: 'source',
        provides: 'video'
      }, {
        media: 'music',
        label: 'Music',
        type: 'source',
        provides: 'audio'
      }, {
        media: 'music',
        label: 'Audio add-ons',
        type: 'addon',
        provides: 'audio',
        addonType: 'xbmc.addon.audio',
        content: 'unknown'
      }, {
        media: 'video',
        label: 'Video add-ons',
        type: 'addon',
        provides: 'files',
        addonType: 'xbmc.addon.video',
        content: 'unknown'
      }
    ],
    directorySeparator: '/',
    getEntity: function(id, options) {
      var entity;
      entity = new App.KodiEntities.File();
      entity.set({
        file: id,
        properties: helpers.entities.getFields(API.fields, 'full')
      });
      entity.fetch(options);
      return entity;
    },
    getCollection: function(type, options) {
      var collection, defaultOptions;
      defaultOptions = {
        cache: true,
        useNamedParameters: true
      };
      options = _.extend(defaultOptions, options);
      if (type === 'sources') {
        collection = new KodiEntities.SourceCollection();
      } else {
        collection = new KodiEntities.FileCollection();
      }
      collection.fetch(options);
      return collection;
    },
    parseToFilesAndFolders: function(collection) {
      var all, collections;
      all = collection.getRawCollection();
      collections = {};
      collections.file = new KodiEntities.FileCustomCollection(_.where(all, {
        filetype: 'file'
      }));
      collections.directory = new KodiEntities.FileCustomCollection(_.where(all, {
        filetype: 'directory'
      }));
      return collections;
    },
    getSources: function() {
      var collection, commander, commands, len, n, ref, source;
      commander = App.request("command:kodi:controller", 'auto', 'Commander');
      commands = [];
      collection = new KodiEntities.SourceCollection();
      ref = this.sources;
      for (n = 0, len = ref.length; n < len; n++) {
        source = ref[n];
        if (source.type === 'source') {
          commands.push({
            method: 'Files.GetSources',
            params: [source.media]
          });
        }
        if (source.type === 'addon') {
          commands.push({
            method: 'Addons.GetAddons',
            params: [source.addonType, source.content, true, this.addonFields]
          });
        }
      }
      commander.multipleCommands(commands, (function(_this) {
        return function(resp) {
          var i, item, len1, model, o, ref1, responseKey;
          for (i in resp) {
            item = resp[i];
            source = _this.sources[i];
            responseKey = source.type + 's';
            if (item[responseKey]) {
              ref1 = item[responseKey];
              for (o = 0, len1 = ref1.length; o < len1; o++) {
                model = ref1[o];
                model.media = source.media;
                model.sourcetype = source.type;
                if (source.type === 'addon') {
                  model.file = _this.createAddonFile(model);
                  model.label = model.name;
                }
                model.url = _this.createFileUrl(source.media, model.file);
                collection.add(model);
              }
            }
          }
          collection = _this.addPlaylists(collection);
          return collection.trigger('cachesync');
        };
      })(this));
      return collection;
    },
    parseSourceCollection: function(collection) {
      var all, items, len, n, ref, source;
      all = collection.getRawCollection();
      collection = [];
      ref = this.sources;
      for (n = 0, len = ref.length; n < len; n++) {
        source = ref[n];
        items = _.where(all, {
          media: source.media
        });
        if (items.length > 0 && source.type === 'source') {
          source.sources = new KodiEntities.SourceCollection(items);
          source.url = 'browser/' + source.media;
          collection.push(source);
        }
      }
      return new KodiEntities.SourceSetCollection(collection);
    },
    createFileUrl: function(media, file) {
      return 'browser/' + media + '/' + encodeURIComponent(file);
    },
    createAddonFile: function(addon) {
      return 'plugin://' + addon.addonid + this.directorySeparator;
    },
    parseFiles: function(items, media) {
      var i, item;
      for (i in items) {
        item = items[i];
        if (!item.parsed) {
          item = App.request("images:path:entity", item);
          items[i] = this.correctFileType(item);
          items[i].media = media;
          items[i].player = this.getPlayer(media);
          items[i].url = this.createFileUrl(media, item.file);
          items[i].parsed = true;
          items[i].defaultSort = parseInt(i);
          items[i].label = helpers.global.removeBBCode(item.label);
        }
      }
      return items;
    },
    addPlaylists: function(collection) {
      var len, model, n, type, types;
      types = ['video', 'music'];
      for (n = 0, len = types.length; n < len; n++) {
        type = types[n];
        model = this.createPathModel(type, t.gettext('Playlists'), 'special://profile/playlists/' + type);
        model.sourcetype = 'playlist';
        collection.add(model);
      }
      return collection;
    },
    correctFileType: function(item) {
      var directoryMimeTypes;
      directoryMimeTypes = ['x-directory/normal'];
      if (item.mimetype && helpers.global.inArray(item.mimetype, directoryMimeTypes)) {
        item.filetype = 'directory';
      }
      return item;
    },
    createPathCollection: function(file, sourcesCollection) {
      var allSources, basePath, excludedPaths, items, len, len1, n, o, parentSource, part, pathParts, source;
      items = [];
      parentSource = {};
      allSources = sourcesCollection.getRawCollection();
      for (n = 0, len = allSources.length; n < len; n++) {
        source = allSources[n];
        if (parentSource.file) {
          continue;
        }
        if (helpers.global.stringStartsWith(source.file, file)) {
          parentSource = source;
        }
      }
      if (parentSource.file) {
        items.push(parentSource);
        basePath = parentSource.file;
        pathParts = helpers.global.stringStripStartsWith(parentSource.file, file).split(this.directorySeparator);
        excludedPaths = App.request("addon:excludedPaths", parentSource.addonid);
        for (o = 0, len1 = pathParts.length; o < len1; o++) {
          part = pathParts[o];
          if (part !== '') {
            basePath += part + this.directorySeparator;
            if (excludedPaths.indexOf(basePath) === -1) {
              items.push(this.createPathModel(parentSource.media, part, basePath));
            }
          }
        }
      }
      return new KodiEntities.FileCustomCollection(items);
    },
    createPathModel: function(media, label, file) {
      var model;
      model = {
        label: label,
        file: file,
        media: media,
        url: this.createFileUrl(media, file)
      };
      return model;
    },
    getPlayer: function(media) {
      if (media === 'music') {
        'audio';
      }
      return media;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.EmptyFile = (function(superClass) {
    extend(EmptyFile, superClass);

    function EmptyFile() {
      return EmptyFile.__super__.constructor.apply(this, arguments);
    }

    EmptyFile.prototype.idAttribute = "file";

    EmptyFile.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        filetype: 'directory',
        media: '',
        label: '',
        url: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    return EmptyFile;

  })(App.KodiEntities.Model);
  KodiEntities.File = (function(superClass) {
    extend(File, superClass);

    function File() {
      return File.__super__.constructor.apply(this, arguments);
    }

    File.prototype.methods = {
      read: ['Files.GetFileDetails', 'file', 'properties']
    };

    File.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.filedetails != null ? resp.filedetails : resp;
      if (resp.filedetails != null) {
        obj.fullyloaded = true;
      }
      return obj;
    };

    return File;

  })(KodiEntities.EmptyFile);
  KodiEntities.FileCollection = (function(superClass) {
    extend(FileCollection, superClass);

    function FileCollection() {
      return FileCollection.__super__.constructor.apply(this, arguments);
    }

    FileCollection.prototype.model = KodiEntities.File;

    FileCollection.prototype.methods = {
      read: ['Files.GetDirectory', 'directory', 'media', 'properties', 'sort']
    };

    FileCollection.prototype.args = function() {
      return this.getArgs({
        directory: this.argCheckOption('file', ''),
        media: this.argCheckOption('media', ''),
        properties: this.argFields(helpers.entities.getFields(API.fields, 'small')),
        sort: this.argSort('none', 'ascending')
      });
    };

    FileCollection.prototype.parse = function(resp, xhr) {
      var items;
      items = this.getResult(resp, 'files');
      return API.parseFiles(items, this.options.media);
    };

    return FileCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.FileCustomCollection = (function(superClass) {
    extend(FileCustomCollection, superClass);

    function FileCustomCollection() {
      return FileCustomCollection.__super__.constructor.apply(this, arguments);
    }

    FileCustomCollection.prototype.model = KodiEntities.File;

    return FileCustomCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.Source = (function(superClass) {
    extend(Source, superClass);

    function Source() {
      return Source.__super__.constructor.apply(this, arguments);
    }

    Source.prototype.idAttribute = "file";

    Source.prototype.defaults = {
      label: '',
      file: '',
      media: '',
      url: ''
    };

    return Source;

  })(App.KodiEntities.Model);
  KodiEntities.SourceCollection = (function(superClass) {
    extend(SourceCollection, superClass);

    function SourceCollection() {
      return SourceCollection.__super__.constructor.apply(this, arguments);
    }

    SourceCollection.prototype.model = KodiEntities.Source;

    return SourceCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.SourceSet = (function(superClass) {
    extend(SourceSet, superClass);

    function SourceSet() {
      return SourceSet.__super__.constructor.apply(this, arguments);
    }

    SourceSet.prototype.idAttribute = "file";

    SourceSet.prototype.defaults = {
      label: '',
      sources: ''
    };

    return SourceSet;

  })(App.KodiEntities.Model);
  KodiEntities.SourceSetCollection = (function(superClass) {
    extend(SourceSetCollection, superClass);

    function SourceSetCollection() {
      return SourceSetCollection.__super__.constructor.apply(this, arguments);
    }

    SourceSetCollection.prototype.model = KodiEntities.Source;

    return SourceSetCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("file:entity", function(id, options) {
    if (options == null) {
      options = {};
    }
    return API.getEntity(id, options);
  });
  App.reqres.setHandler("file:url:entity", function(media, hash) {
    var file;
    file = decodeURIComponent(hash);
    return new KodiEntities.EmptyFile({
      media: media,
      file: file,
      url: API.createFileUrl(media, file)
    });
  });
  App.reqres.setHandler("file:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getCollection('files', options);
  });
  App.reqres.setHandler("file:path:entities", function(file, sourceCollection) {
    return API.createPathCollection(file, sourceCollection);
  });
  App.reqres.setHandler("file:parsed:entities", function(collection) {
    return API.parseToFilesAndFolders(collection);
  });
  App.reqres.setHandler("file:source:entities", function(media) {
    return API.getSources();
  });
  App.reqres.setHandler("file:source:media:entities", function(collection) {
    return API.parseSourceCollection(collection);
  });
  return App.reqres.setHandler("file:source:mediatypes", function() {
    return API.availableSources;
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fields: {
      minimal: ['title'],
      small: ['thumbnail'],
      full: []
    },
    getEntity: function(collection, genre) {
      return collection.findWhere({
        title: genre
      });
    },
    getCollection: function(type, options) {
      var collection;
      collection = new KodiEntities.GenreAudioCollection();
      collection.fetch(helpers.entities.buildOptions(options));
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Genre = (function(superClass) {
    extend(Genre, superClass);

    function Genre() {
      return Genre.__super__.constructor.apply(this, arguments);
    }

    Genre.prototype.defaults = function() {
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), {});
    };

    Genre.prototype.parse = function(obj, xhr) {
      obj.fullyloaded = true;
      obj.url = 'music/genre/' + encodeURIComponent(obj.title);
      return obj;
    };

    return Genre;

  })(App.KodiEntities.Model);
  KodiEntities.GenreAudioCollection = (function(superClass) {
    extend(GenreAudioCollection, superClass);

    function GenreAudioCollection() {
      return GenreAudioCollection.__super__.constructor.apply(this, arguments);
    }

    GenreAudioCollection.prototype.model = KodiEntities.Genre;

    GenreAudioCollection.prototype.methods = {
      read: ['AudioLibrary.GetGenres', 'properties', 'limits', 'sort']
    };

    GenreAudioCollection.prototype.args = function() {
      return this.getArgs({
        properties: helpers.entities.getFields(API.fields, 'small'),
        limits: this.argLimit(),
        sort: this.argSort('title', 'ascending')
      });
    };

    GenreAudioCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'genres');
    };

    return GenreAudioCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("genre:entity", function(collection, genre) {
    return API.getEntity(collection, genre);
  });
  return App.reqres.setHandler("genre:entities", function(type, options) {
    if (type == null) {
      type = 'audio';
    }
    if (options == null) {
      options = {};
    }
    return API.getCollection(type, options);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fields: {
      minimal: ['title', 'thumbnail'],
      small: ['playcount', 'lastplayed', 'dateadded', 'resume', 'rating', 'year', 'file', 'genre', 'writer', 'director', 'cast', 'set', 'studio', 'mpaa'],
      full: ['fanart', 'plotoutline', 'imdbnumber', 'runtime', 'streamdetails', 'plot', 'trailer', 'sorttitle', 'originaltitle', 'country', 'tag']
    },
    getEntity: function(id, options) {
      var entity;
      entity = new App.KodiEntities.Movie();
      entity.set({
        movieid: parseInt(id),
        properties: helpers.entities.getFields(API.fields, 'full')
      });
      entity.fetch(options);
      return entity;
    },
    getCollection: function(options) {
      var collection;
      collection = new KodiEntities.MovieCollection();
      collection.fetch(helpers.entities.buildOptions(options));
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Movie = (function(superClass) {
    extend(Movie, superClass);

    function Movie() {
      return Movie.__super__.constructor.apply(this, arguments);
    }

    Movie.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        movieid: 1,
        movie: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    Movie.prototype.methods = {
      read: ['VideoLibrary.GetMovieDetails', 'movieid', 'properties']
    };

    Movie.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.moviedetails != null ? resp.moviedetails : resp;
      if (resp.moviedetails != null) {
        obj.fullyloaded = true;
      }
      obj.unwatched = obj.playcount > 0 ? 0 : 1;
      return this.parseModel('movie', obj, obj.movieid);
    };

    return Movie;

  })(App.KodiEntities.Model);
  KodiEntities.MovieCollection = (function(superClass) {
    extend(MovieCollection, superClass);

    function MovieCollection() {
      return MovieCollection.__super__.constructor.apply(this, arguments);
    }

    MovieCollection.prototype.model = KodiEntities.Movie;

    MovieCollection.prototype.methods = {
      read: ['VideoLibrary.GetMovies', 'properties', 'limits', 'sort', 'filter']
    };

    MovieCollection.prototype.args = function() {
      return this.getArgs({
        properties: this.argFields(helpers.entities.getFields(API.fields, 'small')),
        limits: this.argLimit(),
        sort: this.argSort('title', 'ascending'),
        filter: this.argFilter()
      });
    };

    MovieCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'movies');
    };

    return MovieCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.MovieCustomCollection = (function(superClass) {
    extend(MovieCustomCollection, superClass);

    function MovieCustomCollection() {
      return MovieCustomCollection.__super__.constructor.apply(this, arguments);
    }

    MovieCustomCollection.prototype.model = KodiEntities.Movie;

    return MovieCustomCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("movie:entity", function(id, options) {
    if (options == null) {
      options = {};
    }
    return API.getEntity(id, options);
  });
  App.reqres.setHandler("movie:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getCollection(options);
  });
  App.reqres.setHandler("movie:build:collection", function(items) {
    return new KodiEntities.MovieCustomCollection(items);
  });
  return App.reqres.setHandler("movie:fields", function(type) {
    if (type == null) {
      type = 'full';
    }
    return helpers.entities.getFields(API.fields, type);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    fields: {
      minimal: ['title'],
      small: ['thumbnail', 'file', 'genre', 'artist', 'year', 'playcount', 'dateadded', 'streamdetails', 'album', 'resume', 'director', 'rating'],
      full: ['fanart', 'studio', 'plot', 'track', 'tag']
    },
    getVideo: function(id, options) {
      var artist;
      artist = new App.KodiEntities.MusicVideo();
      artist.set({
        musicvideoid: parseInt(id),
        properties: helpers.entities.getFields(API.fields, 'full')
      });
      artist.fetch(options);
      return artist;
    },
    getVideos: function(options) {
      var collection;
      collection = new KodiEntities.MusicVideoCollection();
      collection.fetch(helpers.entities.buildOptions(options));
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.MusicVideo = (function(superClass) {
    extend(MusicVideo, superClass);

    function MusicVideo() {
      return MusicVideo.__super__.constructor.apply(this, arguments);
    }

    MusicVideo.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        musicvideoid: 1,
        title: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    MusicVideo.prototype.methods = {
      read: ['VideoLibrary.GetMusicVideoDetails', 'musicvideoid', 'properties']
    };

    MusicVideo.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.musicvideodetails != null ? resp.musicvideodetails : resp;
      if (resp.musicvideodetails != null) {
        obj.fullyloaded = true;
      }
      return this.parseModel('musicvideo', obj, obj.musicvideoid);
    };

    return MusicVideo;

  })(App.KodiEntities.Model);
  KodiEntities.MusicVideoCollection = (function(superClass) {
    extend(MusicVideoCollection, superClass);

    function MusicVideoCollection() {
      return MusicVideoCollection.__super__.constructor.apply(this, arguments);
    }

    MusicVideoCollection.prototype.model = KodiEntities.MusicVideo;

    MusicVideoCollection.prototype.methods = {
      read: ['VideoLibrary.GetMusicVideos', 'properties', 'limits', 'sort', 'filter']
    };

    MusicVideoCollection.prototype.args = function() {
      return this.getArgs({
        properties: this.argFields(helpers.entities.getFields(API.fields, 'full')),
        limits: this.argLimit(),
        sort: this.argSort('title', 'ascending'),
        filter: this.argFilter()
      });
    };

    MusicVideoCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'musicvideos');
    };

    return MusicVideoCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.MusicVideoCustomCollection = (function(superClass) {
    extend(MusicVideoCustomCollection, superClass);

    function MusicVideoCustomCollection() {
      return MusicVideoCustomCollection.__super__.constructor.apply(this, arguments);
    }

    MusicVideoCustomCollection.prototype.model = KodiEntities.MusicVideo;

    return MusicVideoCustomCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("musicvideo:entity", function(id, options) {
    if (options == null) {
      options = {};
    }
    return API.getVideo(id, options);
  });
  App.reqres.setHandler("musicvideo:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getVideos(options);
  });
  App.reqres.setHandler("musicvideo:fields", function(type) {
    if (type == null) {
      type = 'full';
    }
    return helpers.entities.getFields(API.fields, type);
  });
  return App.reqres.setHandler("musicvideo:build:collection", function(items) {
    return new KodiEntities.MusicVideoCustomCollection(items);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fields: {
      minimal: ['title', 'thumbnail', 'file'],
      small: ['artist', 'genre', 'year', 'rating', 'album', 'track', 'duration', 'playcount', 'dateadded', 'episode', 'artistid', 'albumid', 'tvshowid'],
      full: ['fanart']
    },
    canThumbsUp: ['song', 'movie', 'episode'],
    getCollection: function(options) {
      var collection, defaultOptions;
      defaultOptions = {
        cache: false,
        useNamedParameters: true
      };
      options = _.extend(defaultOptions, options);
      collection = new KodiEntities.PlaylistCollection();
      collection.fetch(options);
      return collection;
    },
    getType: function(item, media) {
      var type;
      type = 'file';
      if (item.id !== void 0 && item.id !== '') {
        if (media === 'audio') {
          type = 'song';
        } else if (media === 'video') {
          if (item.episode !== '') {
            type = 'episode';
          } else {
            type = 'movie';
          }
        }
      }
      return type;
    },
    parseItems: function(items, options) {
      var i, item;
      for (i in items) {
        item = items[i];
        item.position = parseInt(i);
        items[i] = this.parseItem(item, options);
      }
      return items;
    },
    parseItem: function(item, options) {
      item.playlistid = options.playlistid;
      item.media = options.media;
      item.player = 'kodi';
      if (!item.type || item.type === 'unknown') {
        item.type = API.getType(item, options.media);
      }
      if (item.type === 'file') {
        item.id = item.file;
      }
      item.uid = helpers.entities.createUid(item);
      item.canThumbsUp = helpers.global.inArray(item.type, API.canThumbsUp);
      item.thumbsUp = false;
      return item;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.PlaylistItem = (function(superClass) {
    extend(PlaylistItem, superClass);

    function PlaylistItem() {
      return PlaylistItem.__super__.constructor.apply(this, arguments);
    }

    PlaylistItem.prototype.idAttribute = "position";

    PlaylistItem.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        position: 0
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    PlaylistItem.prototype.parse = function(resp, xhr) {
      var model;
      resp.fullyloaded = true;
      model = this.parseModel(resp.type, resp, resp.id);
      model.url = helpers.url.playlistUrl(model);
      return model;
    };

    return PlaylistItem;

  })(App.KodiEntities.Model);
  KodiEntities.PlaylistCollection = (function(superClass) {
    extend(PlaylistCollection, superClass);

    function PlaylistCollection() {
      return PlaylistCollection.__super__.constructor.apply(this, arguments);
    }

    PlaylistCollection.prototype.model = KodiEntities.PlaylistItem;

    PlaylistCollection.prototype.methods = {
      read: ['Playlist.GetItems', 'playlistid', 'properties', 'limits']
    };

    PlaylistCollection.prototype.args = function() {
      return this.getArgs({
        playlistid: this.argCheckOption('playlistid', 0),
        properties: this.argFields(helpers.entities.getFields(API.fields, 'small')),
        limits: this.argLimit()
      });
    };

    PlaylistCollection.prototype.parse = function(resp, xhr) {
      var items;
      items = this.getResult(resp, 'items');
      return API.parseItems(items, this.options);
    };

    return PlaylistCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("playlist:kodi:entities", function(media) {
    var collection, options, playlist;
    if (media == null) {
      media = 'audio';
    }
    playlist = App.request("command:kodi:controller", media, 'PlayList');
    options = {};
    options.media = media;
    options.playlistid = playlist.getPlayer();
    collection = API.getCollection(options);
    collection.sortCollection('position', 'asc');
    return collection;
  });
  return App.reqres.setHandler("playlist:kodi:entity:api", function() {
    return API;
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fieldsChannel: {
      minimal: ['thumbnail'],
      small: ['channeltype', 'hidden', 'locked', 'channel', 'lastplayed', 'broadcastnow', 'isrecording'],
      full: []
    },
    fieldsRecording: {
      minimal: ['channel', 'file', 'title'],
      small: ['resume', 'plot', 'genre', 'playcount', 'starttime', 'endtime', 'runtime', 'icon', 'art', 'streamurl', 'directory', 'radio', 'isdeleted', 'channeluid'],
      full: []
    },
    getChannelEntity: function(id, options) {
      var entity;
      if (options == null) {
        options = {};
      }
      entity = new App.KodiEntities.Channel();
      entity.set({
        channelid: parseInt(id),
        properties: helpers.entities.getFields(API.fieldsChannel, 'full')
      });
      entity.fetch(options);
      return entity;
    },
    getChannelCollection: function(options) {
      var collection, defaultOptions;
      defaultOptions = {
        useNamedParameters: true
      };
      options = _.extend(defaultOptions, options);
      collection = new KodiEntities.ChannelCollection();
      collection.fetch(options);
      return collection;
    },
    getRecordingEntity: function(id, options) {
      var entity;
      if (options == null) {
        options = {};
      }
      entity = new App.KodiEntities.Recording();
      entity.set({
        recordingid: parseInt(id),
        properties: helpers.entities.getFields(API.fieldsRecording, 'full')
      });
      entity.fetch(options);
      return entity;
    },
    getRecordingCollection: function(options) {
      var collection, defaultOptions;
      defaultOptions = {
        useNamedParameters: true
      };
      options = _.extend(defaultOptions, options);
      collection = new KodiEntities.RecordingCollection();
      collection.fetch(options);
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Channel = (function(superClass) {
    extend(Channel, superClass);

    function Channel() {
      return Channel.__super__.constructor.apply(this, arguments);
    }

    Channel.prototype.defaults = function() {
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fieldsChannel, 'full'), {});
    };

    Channel.prototype.methods = {
      read: ['PVR.GetChannelDetails', 'channelid', 'properties']
    };

    Channel.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.channeldetails != null ? resp.channeldetails : resp;
      if (resp.channeldetails != null) {
        obj.fullyloaded = true;
      }
      return this.parseModel('channel', obj, obj.channelid);
    };

    return Channel;

  })(App.KodiEntities.Model);
  KodiEntities.ChannelCollection = (function(superClass) {
    extend(ChannelCollection, superClass);

    function ChannelCollection() {
      return ChannelCollection.__super__.constructor.apply(this, arguments);
    }

    ChannelCollection.prototype.model = KodiEntities.Channel;

    ChannelCollection.prototype.methods = {
      read: ['PVR.GetChannels', 'channelgroupid', 'properties', 'limits']
    };

    ChannelCollection.prototype.args = function() {
      return this.getArgs({
        channelgroupid: this.argCheckOption('group', 0),
        properties: helpers.entities.getFields(API.fieldsChannel, 'small'),
        limits: this.argLimit()
      });
    };

    ChannelCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'channels');
    };

    return ChannelCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.Recording = (function(superClass) {
    extend(Recording, superClass);

    function Recording() {
      return Recording.__super__.constructor.apply(this, arguments);
    }

    Recording.prototype.defaults = function() {
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fieldsRecording, 'full'), {});
    };

    Recording.prototype.methods = {
      read: ['PVR.GetRecordingDetails', 'recordingid', 'properties']
    };

    Recording.prototype.parse = function(obj, xhr) {
      obj.fullyloaded = true;
      obj.player = obj.radio ? 'audio' : 'video';
      return this.parseModel('recording', obj, obj.recordingid);
    };

    return Recording;

  })(App.KodiEntities.Model);
  KodiEntities.RecordingCollection = (function(superClass) {
    extend(RecordingCollection, superClass);

    function RecordingCollection() {
      return RecordingCollection.__super__.constructor.apply(this, arguments);
    }

    RecordingCollection.prototype.model = KodiEntities.Recording;

    RecordingCollection.prototype.methods = {
      read: ['PVR.GetRecordings', 'properties', 'limits']
    };

    RecordingCollection.prototype.args = function() {
      return this.getArgs({
        properties: helpers.entities.getFields(API.fieldsRecording, 'small'),
        limits: this.argLimit()
      });
    };

    RecordingCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'recordings');
    };

    return RecordingCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("channel:entity", function(channelid, options) {
    if (options == null) {
      options = {};
    }
    return API.getChannelEntity(channelid, options);
  });
  App.reqres.setHandler("channel:entities", function(group, options) {
    if (group == null) {
      group = 'alltv';
    }
    if (options == null) {
      options = {};
    }
    options.group = group;
    return API.getChannelCollection(options);
  });
  App.reqres.setHandler("recording:entity", function(channelid, options) {
    if (options == null) {
      options = {};
    }
    return API.getRecordingEntity(channelid, options);
  });
  return App.reqres.setHandler("recording:entities", function(group, options) {
    if (group == null) {
      group = 'alltv';
    }
    if (options == null) {
      options = {};
    }
    options.group = group;
    return API.getRecordingCollection(options);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fields: {
      minimal: ['season'],
      small: ['showtitle', 'playcount', 'thumbnail', 'tvshowid', 'episode', 'watchedepisodes', 'fanart'],
      full: []
    },
    getEntity: function(collection, season) {
      return collection.findWhere({
        season: season
      });
    },
    getCollection: function(options) {
      var collection, defaultOptions;
      defaultOptions = {
        cache: false,
        expires: config.get('static', 'collectionCacheExpiry'),
        useNamedParameters: true
      };
      options = _.extend(defaultOptions, options);
      collection = new KodiEntities.SeasonCollection();
      collection.fetch(options);
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Season = (function(superClass) {
    extend(Season, superClass);

    function Season() {
      return Season.__super__.constructor.apply(this, arguments);
    }

    Season.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        seasonid: 1,
        season: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    Season.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.seasondetails != null ? resp.seasondetails : resp;
      if (resp.seasondetails != null) {
        obj.fullyloaded = true;
      }
      obj.unwatched = obj.episode - obj.watchedepisodes;
      return this.parseModel('season', obj, obj.tvshowid + '/' + obj.season);
    };

    return Season;

  })(App.KodiEntities.Model);
  KodiEntities.SeasonCollection = (function(superClass) {
    extend(SeasonCollection, superClass);

    function SeasonCollection() {
      return SeasonCollection.__super__.constructor.apply(this, arguments);
    }

    SeasonCollection.prototype.model = KodiEntities.Season;

    SeasonCollection.prototype.methods = {
      read: ['VideoLibrary.GetSeasons', 'tvshowid', 'properties', 'limits', 'sort']
    };

    SeasonCollection.prototype.args = function() {
      return this.getArgs({
        tvshowid: this.argCheckOption('tvshowid', 0),
        properties: this.argFields(helpers.entities.getFields(API.fields, 'small')),
        limits: this.argLimit(),
        sort: this.argSort("season", "ascending")
      });
    };

    SeasonCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'seasons');
    };

    return SeasonCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("season:entity", function(collection, season) {
    return API.getEntity(collection, season);
  });
  App.reqres.setHandler("season:entities", function(tvshowid, options) {
    if (options == null) {
      options = {};
    }
    options.tvshowid = tvshowid;
    return API.getCollection(options);
  });
  return App.reqres.setHandler("season:fields", function(type) {
    if (type == null) {
      type = 'full';
    }
    return helpers.entities.getFields(API.fields, type);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    settingsType: {
      sections: "SettingSectionCollection",
      categories: "SettingCategoryCollection",
      settings: "SettingCollection"
    },
    ignoreKeys: ['weather'],
    fields: {
      minimal: ['settingstype'],
      small: ['title', 'control', 'options', 'parent', 'enabled', 'type', 'value', 'enabled', 'default', 'help', 'path', 'description', 'section', 'category'],
      full: []
    },
    getSettingsLevel: function() {
      return config.getLocal('kodiSettingsLevel', 'standard');
    },
    getEntity: function(id, collection) {
      var model;
      model = collection.where({
        method: id
      }).shift();
      return model;
    },
    getCollection: function(options) {
      var collection, collectionMethod;
      if (options == null) {
        options = {
          type: 'sections'
        };
      }
      collectionMethod = this.settingsType[options.type];
      collection = new KodiEntities[collectionMethod]();
      options.useNamedParameters = true;
      collection.fetch(options);
      if (options.section && options.type === 'settings') {
        collection.where({
          section: options.section
        });
      }
      return collection;
    },
    getSettings: function(section, categories, callback) {
      var commander, commands, items;
      if (categories == null) {
        categories = [];
      }
      commander = App.request("command:kodi:controller", 'auto', 'Commander');
      commands = [];
      items = [];
      $(categories).each((function(_this) {
        return function(i, category) {
          return commands.push({
            method: 'Settings.GetSettings',
            params: [
              _this.getSettingsLevel(), {
                "section": section,
                "category": category
              }
            ]
          });
        };
      })(this));
      return commander.multipleCommands(commands, (function(_this) {
        return function(resp) {
          var catId, i, item;
          for (i in resp) {
            item = resp[i];
            catId = categories[i];
            items[catId] = _this.parseCollection(item.settings, 'settings');
          }
          return callback(items);
        };
      })(this));
    },
    parseCollection: function(itemsRaw, type) {
      var item, items, method;
      if (itemsRaw == null) {
        itemsRaw = [];
      }
      if (type == null) {
        type = 'settings';
      }
      items = [];
      for (method in itemsRaw) {
        item = itemsRaw[method];
        if (_.lastIndexOf(this.ignoreKeys, item.id) === -1) {
          items.push(this.parseItem(item, type));
        }
      }
      return items;
    },
    parseItem: function(item, type) {
      if (type == null) {
        type = 'settings';
      }
      item.settingstype = type;
      item.title = item.label;
      item.description = item.help;
      item.path = 'settings/kodi/' + item.id;
      return item;
    },
    saveSettings: function(data, callback) {
      var commander, commands, key, val;
      commander = App.request("command:kodi:controller", 'auto', 'Commander');
      commands = [];
      for (key in data) {
        val = data[key];
        commands.push({
          method: 'Settings.SetSettingValue',
          params: [key, this.valuePreSave(val)]
        });
      }
      return commander.multipleCommands(commands, (function(_this) {
        return function(resp) {
          if (callback) {
            return callback(resp);
          }
        };
      })(this));
    },
    valuePreSave: function(val) {
      if (val === String(parseInt(val))) {
        val = parseInt(val);
      }
      return val;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.Setting = (function(superClass) {
    extend(Setting, superClass);

    function Setting() {
      return Setting.__super__.constructor.apply(this, arguments);
    }

    Setting.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        id: 0,
        params: {}
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'small'), fields);
    };

    return Setting;

  })(App.KodiEntities.Model);
  KodiEntities.SettingSectionCollection = (function(superClass) {
    extend(SettingSectionCollection, superClass);

    function SettingSectionCollection() {
      return SettingSectionCollection.__super__.constructor.apply(this, arguments);
    }

    SettingSectionCollection.prototype.model = KodiEntities.Setting;

    SettingSectionCollection.prototype.methods = {
      read: ['Settings.GetSections']
    };

    SettingSectionCollection.prototype.parse = function(resp, xhr) {
      var items;
      items = this.getResult(resp, this.options.type);
      return API.parseCollection(items, this.options.type);
    };

    return SettingSectionCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.SettingCategoryCollection = (function(superClass) {
    extend(SettingCategoryCollection, superClass);

    function SettingCategoryCollection() {
      return SettingCategoryCollection.__super__.constructor.apply(this, arguments);
    }

    SettingCategoryCollection.prototype.model = KodiEntities.Setting;

    SettingCategoryCollection.prototype.methods = {
      read: ['Settings.GetCategories', 'level', 'section']
    };

    SettingCategoryCollection.prototype.args = function() {
      return this.getArgs({
        level: API.getSettingsLevel(),
        section: this.argCheckOption('section', 0)
      });
    };

    SettingCategoryCollection.prototype.parse = function(resp, xhr) {
      var items;
      items = this.getResult(resp, this.options.type);
      return API.parseCollection(items, this.options.type);
    };

    return SettingCategoryCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.SettingCollection = (function(superClass) {
    extend(SettingCollection, superClass);

    function SettingCollection() {
      return SettingCollection.__super__.constructor.apply(this, arguments);
    }

    SettingCollection.prototype.model = KodiEntities.Setting;

    SettingCollection.prototype.methods = {
      read: ['Settings.GetSettings', 'level']
    };

    SettingCollection.prototype.args = function() {
      return this.getArgs({
        level: API.getSettingsLevel()
      });
    };

    SettingCollection.prototype.parse = function(resp, xhr) {
      var items;
      items = this.getResult(resp, this.options.type);
      return API.parseCollection(items, this.options.type);
    };

    return SettingCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("settings:kodi:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getCollection(options);
  });
  App.reqres.setHandler("settings:kodi:filtered:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getSettings(options.section, options.categories, function(items) {
      return options.callback(items);
    });
  });
  return App.commands.setHandler("settings:kodi:save:entities", function(data, callback) {
    if (data == null) {
      data = {};
    }
    return API.saveSettings(data, callback);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    songsByIdMax: 50,
    fields: {
      minimal: ['title', 'file'],
      small: ['thumbnail', 'artist', 'artistid', 'album', 'albumid', 'lastplayed', 'track', 'year', 'duration'],
      full: ['fanart', 'genre', 'disc', 'rating', 'albumartist']
    },
    getSong: function(id, options) {
      var artist;
      artist = new App.KodiEntities.Song();
      artist.set({
        songid: parseInt(id),
        properties: helpers.entities.getFields(API.fields, 'full')
      });
      artist.fetch(options);
      return artist;
    },
    getFilteredSongs: function(options) {
      var songs;
      songs = new KodiEntities.SongFilteredCollection();
      songs.fetch(helpers.entities.buildOptions(options));
      return songs;
    },
    getCustomSongsCollection: function(type, ids, callback) {
      var i, id, items, options, req, results1;
      if (type === 'songid') {
        return this.getSongsByIds(ids, -1, callback);
      } else {
        items = [];
        options = {
          filter: {}
        };
        req = 0;
        results1 = [];
        for (i in ids) {
          id = ids[i];
          options.filter[type] = id;
          options.success = function(collection) {
            items = items.concat(collection.toJSON());
            req++;
            if (req === ids.length) {
              collection = new KodiEntities.SongCustomCollection(items);
              return callback(collection);
            }
          };
          results1.push(this.getFilteredSongs(options));
        }
        return results1;
      }
    },
    parseSongsToAlbumSongs: function(songs) {
      var albumid, collections, len, n, parsedRaw, song, songSet, songsRaw, year;
      songsRaw = songs.getRawCollection();
      parsedRaw = {};
      collections = [];
      for (n = 0, len = songsRaw.length; n < len; n++) {
        song = songsRaw[n];
        if (!parsedRaw[song.albumid]) {
          parsedRaw[song.albumid] = [];
        }
        parsedRaw[song.albumid].push(song);
      }
      for (albumid in parsedRaw) {
        songSet = parsedRaw[albumid];
        year = songSet[0].year ? songSet[0].year : 0;
        collections.push({
          songs: new KodiEntities.SongCustomCollection(songSet),
          albumid: parseInt(albumid),
          sort: 0 - parseInt(year)
        });
      }
      collections = _.sortBy(collections, 'sort');
      return collections;
    },
    getSongsByIds: function(songIds, max, callback) {
      var cache, cacheKey, collection, commander, commands, id, items, len, model, n;
      if (songIds == null) {
        songIds = [];
      }
      if (max == null) {
        max = -1;
      }
      commander = App.request("command:kodi:controller", 'auto', 'Commander');
      songIds = this.getLimitIds(songIds, max);
      cacheKey = 'songs-' + songIds.join('-');
      items = [];
      cache = helpers.cache.get(cacheKey, false);
      if (cache) {
        collection = new KodiEntities.SongCustomCollection(cache);
        if (callback) {
          callback(collection);
        }
      } else {
        model = new KodiEntities.Song();
        commands = [];
        for (n = 0, len = songIds.length; n < len; n++) {
          id = songIds[n];
          commands.push({
            method: 'AudioLibrary.GetSongDetails',
            params: [id, helpers.entities.getFields(API.fields, 'small')]
          });
        }
        if (commands.length > 0) {
          commander.multipleCommands(commands, (function(_this) {
            return function(resp) {
              var item, len1, o, ref;
              ref = _.flatten([resp]);
              for (o = 0, len1 = ref.length; o < len1; o++) {
                item = ref[o];
                items.push(model.parseModel('song', item.songdetails, item.songdetails.songid));
              }
              helpers.cache.set(cacheKey, items);
              collection = new KodiEntities.SongCustomCollection(items);
              if (callback) {
                return callback(collection);
              }
            };
          })(this));
        }
      }
      return collection;
    },
    getLimitIds: function(ids, max) {
      var i, id, ret;
      max = max === -1 ? this.songsByIdMax : max;
      ret = [];
      for (i in ids) {
        id = ids[i];
        if (i < max) {
          ret.push(id);
        }
      }
      return ret;
    }
  };
  KodiEntities.Song = (function(superClass) {
    extend(Song, superClass);

    function Song() {
      return Song.__super__.constructor.apply(this, arguments);
    }

    Song.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        songid: 1,
        artist: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    Song.prototype.methods = {
      read: ['AudioLibrary.GetSongDetails', 'songid', 'properties']
    };

    Song.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.songdetails != null ? resp.songdetails : resp;
      if (resp.songdetails != null) {
        obj.fullyloaded = true;
      }
      return this.parseModel('song', obj, obj.songid);
    };

    return Song;

  })(App.KodiEntities.Model);
  KodiEntities.SongFilteredCollection = (function(superClass) {
    extend(SongFilteredCollection, superClass);

    function SongFilteredCollection() {
      return SongFilteredCollection.__super__.constructor.apply(this, arguments);
    }

    SongFilteredCollection.prototype.model = KodiEntities.Song;

    SongFilteredCollection.prototype.methods = {
      read: ['AudioLibrary.GetSongs', 'properties', 'limits', 'sort', 'filter']
    };

    SongFilteredCollection.prototype.args = function() {
      return this.getArgs({
        properties: this.argFields(helpers.entities.getFields(API.fields, 'small')),
        limits: this.argLimit(),
        sort: this.argSort("track", "ascending"),
        filter: this.argFilter()
      });
    };

    SongFilteredCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'songs');
    };

    return SongFilteredCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.SongCustomCollection = (function(superClass) {
    extend(SongCustomCollection, superClass);

    function SongCustomCollection() {
      return SongCustomCollection.__super__.constructor.apply(this, arguments);
    }

    SongCustomCollection.prototype.model = KodiEntities.Song;

    return SongCustomCollection;

  })(App.KodiEntities.Collection);
  KodiEntities.SongSearchIndexCollection = (function(superClass) {
    extend(SongSearchIndexCollection, superClass);

    function SongSearchIndexCollection() {
      return SongSearchIndexCollection.__super__.constructor.apply(this, arguments);
    }

    SongSearchIndexCollection.prototype.methods = {
      read: ['AudioLibrary.GetSongs']
    };

    return SongSearchIndexCollection;

  })(KodiEntities.SongFilteredCollection);
  App.reqres.setHandler("song:entity", function(id, options) {
    if (options == null) {
      options = {};
    }
    return API.getSong(id, options);
  });
  App.reqres.setHandler("song:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getFilteredSongs(options);
  });
  App.reqres.setHandler("song:custom:entities", function(type, ids, callback) {
    return API.getCustomSongsCollection(type, ids, callback);
  });
  App.reqres.setHandler("song:build:collection", function(items) {
    return new KodiEntities.SongCustomCollection(items);
  });
  App.reqres.setHandler("song:byid:entities", function(songIds, callback) {
    if (songIds == null) {
      songIds = [];
    }
    return API.getSongsByIds(songIds, -1, callback);
  });
  App.reqres.setHandler("song:albumparse:entities", function(songs) {
    return API.parseSongsToAlbumSongs(songs);
  });
  return App.reqres.setHandler("song:fields", function(type) {
    if (type == null) {
      type = 'full';
    }
    return helpers.entities.getFields(API.fields, type);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    fields: {
      minimal: ['title'],
      small: ['thumbnail', 'playcount', 'lastplayed', 'dateadded', 'episode', 'rating', 'year', 'file', 'genre', 'watchedepisodes', 'cast', 'studio', 'mpaa'],
      full: ['fanart', 'imdbnumber', 'episodeguide', 'plot', 'tag', 'sorttitle', 'originaltitle', 'premiered', 'art']
    },
    getEntity: function(id, options) {
      var entity;
      entity = new App.KodiEntities.TVShow();
      entity.set({
        tvshowid: parseInt(id),
        properties: helpers.entities.getFields(API.fields, 'full')
      });
      entity.fetch(options);
      return entity;
    },
    getCollection: function(options) {
      var collection;
      collection = new KodiEntities.TVShowCollection();
      collection.fetch(helpers.entities.buildOptions(options));
      return collection;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.TVShow = (function(superClass) {
    extend(TVShow, superClass);

    function TVShow() {
      return TVShow.__super__.constructor.apply(this, arguments);
    }

    TVShow.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        tvshowid: 1,
        tvshow: ''
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'full'), fields);
    };

    TVShow.prototype.methods = {
      read: ['VideoLibrary.GetTVShowDetails', 'tvshowid', 'properties']
    };

    TVShow.prototype.parse = function(resp, xhr) {
      var obj;
      obj = resp.tvshowdetails != null ? resp.tvshowdetails : resp;
      if (resp.tvshowdetails != null) {
        obj.fullyloaded = true;
      }
      obj.unwatched = obj.episode - obj.watchedepisodes;
      return this.parseModel('tvshow', obj, obj.tvshowid);
    };

    return TVShow;

  })(App.KodiEntities.Model);
  KodiEntities.TVShowCollection = (function(superClass) {
    extend(TVShowCollection, superClass);

    function TVShowCollection() {
      return TVShowCollection.__super__.constructor.apply(this, arguments);
    }

    TVShowCollection.prototype.model = KodiEntities.TVShow;

    TVShowCollection.prototype.methods = {
      read: ['VideoLibrary.GetTVShows', 'properties', 'limits', 'sort', 'filter']
    };

    TVShowCollection.prototype.args = function() {
      return this.getArgs({
        properties: this.argFields(helpers.entities.getFields(API.fields, 'small')),
        limits: this.argLimit(),
        sort: this.argSort('title', 'ascending'),
        filter: this.argFilter()
      });
    };

    TVShowCollection.prototype.parse = function(resp, xhr) {
      return this.getResult(resp, 'tvshows');
    };

    return TVShowCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("tvshow:entity", function(id, options) {
    if (options == null) {
      options = {};
    }
    return API.getEntity(id, options);
  });
  App.reqres.setHandler("tvshow:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getCollection(options);
  });
  return App.reqres.setHandler("tvshow:fields", function(type) {
    if (type == null) {
      type = 'full';
    }
    return helpers.entities.getFields(API.fields, type);
  });
});

this.Kodi.module("KodiEntities", function(KodiEntities, App, Backbone, Marionette, $, _) {

  /*
    API Helpers
   */
  var API;
  API = {
    dictionary: {},
    fields: {
      minimal: [],
      small: ['method', 'description', 'thumbnail', 'params', 'permission', 'returns', 'type', 'namespace', 'methodname'],
      full: []
    },
    getEntity: function(id, collection) {
      var model;
      model = collection.where({
        id: id
      }).shift();
      return model;
    },
    getCollection: function(options) {
      var collection;
      if (options == null) {
        options = {};
      }
      collection = new KodiEntities.ApiMethodCollection();
      collection.fetch(helpers.entities.buildOptions(options));
      return collection;
    },
    parseCollection: function(itemsRaw, type) {
      var item, items, method, methodParts;
      if (itemsRaw == null) {
        itemsRaw = [];
      }
      if (type == null) {
        type = 'method';
      }
      items = [];
      for (method in itemsRaw) {
        item = itemsRaw[method];
        item.method = method;
        item.id = method;
        API.dictionary[item.id] = item.id;
        if (type === 'type') {
          item.params = _.extend({}, item);
          item.description = 'API Type';
        }
        item.type = type;
        methodParts = method.replace('.', '[SPLIT]').split('[SPLIT]');
        item.namespace = methodParts[0];
        item.methodname = methodParts[1];
        items.push(item);
      }
      return items;
    }
  };

  /*
   Models and collections.
   */
  KodiEntities.ApiMethod = (function(superClass) {
    extend(ApiMethod, superClass);

    function ApiMethod() {
      return ApiMethod.__super__.constructor.apply(this, arguments);
    }

    ApiMethod.prototype.defaults = function() {
      var fields;
      fields = _.extend(this.modelDefaults, {
        id: 1,
        params: {}
      });
      return this.parseFieldsToDefaults(helpers.entities.getFields(API.fields, 'small'), fields);
    };

    return ApiMethod;

  })(App.KodiEntities.Model);
  KodiEntities.ApiMethodCollection = (function(superClass) {
    extend(ApiMethodCollection, superClass);

    function ApiMethodCollection() {
      return ApiMethodCollection.__super__.constructor.apply(this, arguments);
    }

    ApiMethodCollection.prototype.model = KodiEntities.ApiMethod;

    ApiMethodCollection.prototype.methods = {
      read: ['JSONRPC.Introspect', 'getdescriptions', 'getmetadata']
    };

    ApiMethodCollection.prototype.args = function() {
      return this.getArgs({
        getdescriptions: true,
        getmetadata: true
      });
    };

    ApiMethodCollection.prototype.parse = function(resp, xhr) {
      var methods, types;
      methods = API.parseCollection(this.getResult(resp, 'methods'), 'method');
      types = API.parseCollection(this.getResult(resp, 'types'), 'type');
      return methods.concat(types);
    };

    return ApiMethodCollection;

  })(App.KodiEntities.Collection);

  /*
   Request Handlers.
   */
  App.reqres.setHandler("introspect:entity", function(id, collection) {
    return API.getEntity(id, collection);
  });
  App.reqres.setHandler("introspect:entities", function(options) {
    if (options == null) {
      options = {};
    }
    return API.getCollection(options);
  });
  return App.reqres.setHandler("introspect:dictionary", function() {
    return API.dictionary;
  });
});


/*
  Custom saved playlists, saved in local storage
 */

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    savedFields: ['id', 'uid', 'position', 'file', 'type', 'label', 'thumbnail', 'artist', 'album', 'albumid', 'artistid', 'artistid', 'tvshowid', 'tvshow', 'year', 'rating', 'duration', 'track', 'url', 'season', 'episode', 'title'],
    playlistKey: 'localplaylist:list',
    playlistItemNamespace: 'localplaylist:item:',
    thumbsUpNamespace: 'thumbs:',
    localPlayerNamespace: 'localplayer:',
    getPlaylistKey: function(key) {
      return this.playlistItemNamespace + key;
    },
    getThumbsKey: function(media) {
      return this.thumbsUpNamespace + media;
    },
    getlocalPlayerKey: function(media) {
      if (media == null) {
        media = 'audio';
      }
      return this.localPlayerNamespace + media;
    },
    getListCollection: function(type) {
      var collection;
      if (type == null) {
        type = 'list';
      }
      collection = new Entities.localPlaylistCollection();
      collection.fetch();
      collection.where({
        type: type
      });
      return collection;
    },
    addList: function(model) {
      var collection;
      collection = this.getListCollection();
      model.id = this.getNextId();
      collection.create(model);
      return model.id;
    },
    getNextId: function() {
      var collection, items, lastItem, nextId;
      collection = API.getListCollection();
      items = collection.getRawCollection();
      if (items.length === 0) {
        nextId = 1;
      } else {
        lastItem = _.max(items, function(item) {
          return item.id;
        });
        nextId = lastItem.id + 1;
      }
      return nextId;
    },
    getItemCollection: function(listId) {
      var collection;
      collection = new Entities.localPlaylistItemCollection([], {
        key: listId
      });
      collection.fetch();
      return collection;
    },
    addItemsToPlaylist: function(playlistId, collection) {
      var item, items, len, n, pos;
      if (_.isArray(collection)) {
        items = collection;
      } else {
        items = collection.getRawCollection();
      }
      collection = this.getItemCollection(playlistId);
      pos = collection.length;
      for (n = 0, len = items.length; n < len; n++) {
        item = items[n];
        collection.create(API.getSavedModelFromSource(item, pos));
        pos++;
      }
      return collection;
    },
    getSavedModelFromSource: function(item, position) {
      var fieldName, idfield, len, n, newItem, ref;
      newItem = {};
      ref = this.savedFields;
      for (n = 0, len = ref.length; n < len; n++) {
        fieldName = ref[n];
        if (item[fieldName]) {
          newItem[fieldName] = item[fieldName];
        }
      }
      newItem.position = parseInt(position);
      idfield = item.type + 'id';
      newItem[idfield] = item[idfield];
      return newItem;
    },
    clearPlaylist: function(playlistId) {
      var collection, model;
      collection = this.getItemCollection(playlistId);
      while (model = collection.first()) {
        model.destroy();
      }
    }
  };
  Entities.localPlaylist = (function(superClass) {
    extend(localPlaylist, superClass);

    function localPlaylist() {
      return localPlaylist.__super__.constructor.apply(this, arguments);
    }

    localPlaylist.prototype.defaults = {
      id: 0,
      name: '',
      media: '',
      type: 'list'
    };

    return localPlaylist;

  })(Entities.Model);
  Entities.localPlaylistCollection = (function(superClass) {
    extend(localPlaylistCollection, superClass);

    function localPlaylistCollection() {
      return localPlaylistCollection.__super__.constructor.apply(this, arguments);
    }

    localPlaylistCollection.prototype.model = Entities.localPlaylist;

    localPlaylistCollection.prototype.localStorage = new Backbone.LocalStorage(API.playlistKey);

    return localPlaylistCollection;

  })(Entities.Collection);
  Entities.localPlaylistItem = (function(superClass) {
    extend(localPlaylistItem, superClass);

    function localPlaylistItem() {
      return localPlaylistItem.__super__.constructor.apply(this, arguments);
    }

    localPlaylistItem.prototype.idAttribute = "position";

    localPlaylistItem.prototype.defaults = function() {
      var f, fields, len, n, ref;
      fields = {};
      ref = API.savedFields;
      for (n = 0, len = ref.length; n < len; n++) {
        f = ref[n];
        fields[f] = '';
      }
      return fields;
    };

    return localPlaylistItem;

  })(Entities.Model);
  Entities.localPlaylistItemCollection = (function(superClass) {
    extend(localPlaylistItemCollection, superClass);

    function localPlaylistItemCollection() {
      return localPlaylistItemCollection.__super__.constructor.apply(this, arguments);
    }

    localPlaylistItemCollection.prototype.model = Entities.localPlaylistItem;

    localPlaylistItemCollection.prototype.initialize = function(model, options) {
      return this.localStorage = new Backbone.LocalStorage(API.getPlaylistKey(options.key));
    };

    return localPlaylistItemCollection;

  })(Entities.Collection);

  /*
    Saved Playlists
   */
  App.reqres.setHandler("localplaylist:add:entity", function(name, media, type) {
    if (type == null) {
      type = 'list';
    }
    return API.addList({
      name: name,
      media: media,
      type: type
    });
  });
  App.commands.setHandler("localplaylist:remove:entity", function(id) {
    var collection, model;
    collection = API.getListCollection();
    model = collection.findWhere({
      id: parseInt(id)
    });
    return model.destroy();
  });
  App.reqres.setHandler("localplaylist:entities", function() {
    return API.getListCollection();
  });
  App.commands.setHandler("localplaylist:clear:entities", function(playlistId) {
    return API.clearPlaylist(playlistId);
  });
  App.reqres.setHandler("localplaylist:entity", function(id) {
    var collection;
    collection = API.getListCollection();
    return collection.findWhere({
      id: parseInt(id)
    });
  });
  App.reqres.setHandler("localplaylist:item:entities", function(playlistId) {
    return API.getItemCollection(playlistId);
  });
  App.reqres.setHandler("localplaylist:item:add:entities", function(playlistId, collection) {
    return API.addItemsToPlaylist(playlistId, collection);
  });
  App.reqres.setHandler("localplaylist:item:updateorder", function(playlistId, order) {
    var collection, model, newList, newPos, oldPos;
    newList = [];
    collection = API.getItemCollection(playlistId);
    for (newPos in order) {
      oldPos = order[newPos];
      model = collection.findWhere({
        position: parseInt(oldPos)
      }).toJSON();
      model.position = newPos;
      model.id = newPos;
      newList.push(model);
    }
    API.clearPlaylist(playlistId);
    return API.addItemsToPlaylist(playlistId, newList);
  });

  /*
    Thumbs up lists
   */
  App.reqres.setHandler("thumbsup:toggle:entity", function(model) {
    var collection, existing, media;
    media = model.get('type');
    collection = API.getItemCollection(API.getThumbsKey(media));
    existing = collection.findWhere({
      id: model.get('id')
    });
    if (existing) {
      existing.destroy();
    } else {
      collection.create(API.getSavedModelFromSource(model.attributes, model.get('id')));
    }
    return collection;
  });
  App.reqres.setHandler("thumbsup:get:entities", function(media) {
    return API.getItemCollection(API.getThumbsKey(media));
  });
  App.reqres.setHandler("thumbsup:check", function(model) {
    var collection, existing;
    if (model != null) {
      collection = API.getItemCollection(API.getThumbsKey(model.get('type')));
      existing = collection.findWhere({
        id: model.get('id')
      });
      return _.isObject(existing);
    } else {
      return false;
    }
  });

  /*
    Local player lists
   */
  App.reqres.setHandler("localplayer:get:entities", function(media) {
    if (media == null) {
      media = 'audio';
    }
    return API.getItemCollection(API.getlocalPlayerKey(media));
  });
  App.commands.setHandler("localplayer:clear:entities", function(media) {
    if (media == null) {
      media = 'audio';
    }
    return API.clearPlaylist(API.getlocalPlayerKey(media));
  });
  return App.reqres.setHandler("localplayer:item:add:entities", function(collection, media) {
    if (media == null) {
      media = 'audio';
    }
    return API.addItemsToPlaylist(API.getlocalPlayerKey(media), collection);
  });
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    localKey: 'mainNav',
    getItems: function() {
      var items, navCollection;
      navCollection = this.getLocalCollection();
      items = navCollection.getRawCollection();
      if (items.length === 0) {
        items = this.getDefaultItems();
      }
      return items;
    },
    getDefaultItems: function(onlyVisible) {
      var nav;
      if (onlyVisible == null) {
        onlyVisible = true;
      }
      nav = [];
      nav.push({
        id: 1,
        title: tr("Music"),
        path: 'music',
        icon: 'mdi-av-my-library-music',
        classes: 'nav-music',
        parent: 0
      });
      nav.push({
        id: 2,
        title: tr("Music"),
        path: 'music',
        icon: '',
        classes: '',
        parent: 1
      });
      nav.push({
        id: 6,
        title: tr("Genres"),
        path: 'music/genres',
        icon: '',
        classes: '',
        parent: 1
      });
      nav.push({
        id: 7,
        title: tr("Top music"),
        path: 'music/top',
        icon: '',
        classes: '',
        parent: 1
      });
      nav.push({
        id: 3,
        title: tr("Artists"),
        path: 'music/artists',
        icon: '',
        classes: '',
        parent: 1
      });
      nav.push({
        id: 4,
        title: tr("Albums"),
        path: 'music/albums',
        icon: '',
        classes: '',
        parent: 1
      });
      nav.push({
        id: 8,
        title: tr("Videos"),
        path: 'music/videos',
        icon: '',
        classes: '',
        parent: 1
      });
      nav.push({
        id: 11,
        title: tr("Movies"),
        path: 'movies/recent',
        icon: 'mdi-av-movie',
        classes: 'nav-movies',
        parent: 0
      });
      nav.push({
        id: 12,
        title: tr("Movies"),
        path: 'movies/recent',
        icon: '',
        classes: '',
        parent: 11
      });
      nav.push({
        id: 13,
        title: tr("All movies"),
        path: 'movies',
        icon: '',
        classes: '',
        parent: 11
      });
      nav.push({
        id: 21,
        title: tr("TV shows"),
        path: 'tvshows/recent',
        icon: 'mdi-hardware-tv',
        classes: 'nav-tv',
        parent: 0
      });
      nav.push({
        id: 22,
        title: tr("TV shows"),
        path: 'tvshows/recent',
        icon: '',
        classes: '',
        parent: 21
      });
      nav.push({
        id: 23,
        title: tr("All TV shows"),
        path: 'tvshows',
        icon: '',
        classes: '',
        parent: 21
      });
      nav.push({
        id: 31,
        title: tr("Browser"),
        path: 'browser',
        icon: 'mdi-action-view-list',
        classes: 'nav-browser',
        parent: 0
      });
      nav.push({
        id: 81,
        title: tr("PVR"),
        path: 'pvr/tv',
        icon: 'mdi-action-settings-input-antenna',
        classes: 'pvr-link',
        parent: 0,
        visibility: "addon:pvr:enabled"
      });
      nav.push({
        id: 82,
        title: tr("TV Channels"),
        path: 'pvr/tv',
        icon: '',
        classes: '',
        parent: 81
      });
      nav.push({
        id: 83,
        title: tr("Radio Stations"),
        path: 'pvr/radio',
        icon: '',
        classes: '',
        parent: 81
      });
      nav.push({
        id: 84,
        title: tr("Recordings"),
        path: 'pvr/recordings',
        icon: '',
        classes: '',
        parent: 81
      });
      nav.push({
        id: 71,
        title: tr("Add-ons"),
        path: 'addons/all',
        icon: 'mdi-action-extension',
        classes: 'nav-addons',
        parent: 0
      });
      nav.push({
        id: 72,
        title: tr("all"),
        path: 'addons/all',
        icon: '',
        classes: '',
        parent: 71
      });
      nav.push({
        id: 73,
        title: tr("video"),
        path: 'addons/video',
        icon: '',
        classes: '',
        parent: 71
      });
      nav.push({
        id: 74,
        title: tr("audio"),
        path: 'addons/audio',
        icon: '',
        classes: '',
        parent: 71
      });
      nav.push({
        id: 76,
        title: tr("executable"),
        path: 'addons/executable',
        icon: '',
        classes: '',
        parent: 71
      });
      nav.push({
        id: 77,
        title: tr("settings"),
        path: 'settings/addons',
        icon: '',
        classes: '',
        parent: 71
      });
      nav.push({
        id: 41,
        title: tr("Thumbs up"),
        path: 'thumbsup',
        icon: 'mdi-action-thumb-up',
        classes: 'nav-thumbs-up',
        parent: 0
      });
      nav.push({
        id: 42,
        title: tr("Playlists"),
        path: 'playlists',
        icon: 'mdi-action-assignment',
        classes: 'playlists',
        parent: 0
      });
      nav.push({
        id: 51,
        title: tr("Settings"),
        path: 'settings/web',
        icon: 'mdi-action-settings',
        classes: 'nav-settings',
        parent: 0
      });
      nav.push({
        id: 52,
        title: tr("Web interface"),
        path: 'settings/web',
        icon: '',
        classes: '',
        parent: 51
      });
      nav.push({
        id: 54,
        title: tr("Main Menu"),
        path: 'settings/nav',
        icon: '',
        classes: '',
        parent: 51
      });
      nav.push({
        id: 53,
        title: tr("Add-ons"),
        path: 'settings/addons',
        icon: '',
        classes: '',
        parent: 51
      });
      nav.push({
        id: 55,
        title: tr("Search"),
        path: 'settings/search',
        icon: '',
        classes: '',
        parent: 51
      });
      nav.push({
        id: 61,
        title: tr("Help"),
        path: 'help',
        icon: 'mdi-action-help',
        classes: 'nav-help',
        parent: 0
      });
      if (onlyVisible) {
        return this.checkVisibility(nav);
      } else {
        return nav;
      }
    },
    checkVisibility: function(items) {
      var item, len, n, newItems;
      newItems = [];
      for (n = 0, len = items.length; n < len; n++) {
        item = items[n];
        if (item.visibility != null) {
          if (App.request(item.visibility)) {
            newItems.push(item);
          }
        } else {
          newItems.push(item);
        }
      }
      return newItems;
    },
    getLocalCollection: function() {
      var collection;
      collection = new Entities.LocalNavMainCollection([], {
        key: this.localKey
      });
      collection.fetch();
      return collection;
    },
    getStructure: function() {
      var navCollection, navParsed;
      navParsed = this.sortStructure(this.getItems());
      navCollection = new Entities.NavMainCollection(navParsed);
      return navCollection;
    },
    getChildStructure: function(parentId) {
      var childItems, nav, parent;
      nav = this.getDefaultItems(false);
      parent = _.findWhere(nav, {
        id: parentId
      });
      childItems = _.where(nav, {
        parent: parentId
      });
      parent.items = new Entities.NavMainCollection(childItems);
      return new Entities.NavMain(parent);
    },
    sortStructure: function(structure) {
      var children, i, len, model, n, name1, newParents;
      children = {};
      for (n = 0, len = structure.length; n < len; n++) {
        model = structure[n];
        if (!((model.path != null) && model.parent !== 0)) {
          continue;
        }
        model.title = t.gettext(model.title);
        if (children[name1 = model.parent] == null) {
          children[name1] = [];
        }
        children[model.parent].push(model);
      }
      newParents = [];
      for (i in structure) {
        model = structure[i];
        if (model.path != null) {
          if (model.parent === 0) {
            model.children = children[model.id];
            newParents.push(model);
          }
        }
      }
      return newParents;
    },
    getIdfromPath: function(path) {
      var model;
      model = _.findWhere(this.getDefaultItems(), {
        path: path
      });
      if (model != null) {
        return model.id;
      } else {
        return 1;
      }
    },
    saveLocal: function(items) {
      var collection, i, item;
      collection = this.clearLocal();
      for (i in items) {
        item = items[i];
        collection.create(item);
      }
      return collection;
    },
    clearLocal: function() {
      var collection, model;
      collection = this.getLocalCollection();
      while (model = collection.first()) {
        model.destroy();
      }
      return collection;
    }
  };
  Entities.NavMain = (function(superClass) {
    extend(NavMain, superClass);

    function NavMain() {
      return NavMain.__super__.constructor.apply(this, arguments);
    }

    NavMain.prototype.defaults = {
      id: 0,
      title: 'Untitled',
      path: '',
      description: '',
      icon: '',
      classes: '',
      parent: 0,
      children: []
    };

    return NavMain;

  })(App.Entities.Model);
  Entities.NavMainCollection = (function(superClass) {
    extend(NavMainCollection, superClass);

    function NavMainCollection() {
      return NavMainCollection.__super__.constructor.apply(this, arguments);
    }

    NavMainCollection.prototype.model = Entities.NavMain;

    return NavMainCollection;

  })(App.Entities.Collection);
  Entities.LocalNavMainCollection = (function(superClass) {
    extend(LocalNavMainCollection, superClass);

    function LocalNavMainCollection() {
      return LocalNavMainCollection.__super__.constructor.apply(this, arguments);
    }

    LocalNavMainCollection.prototype.model = Entities.NavMain;

    LocalNavMainCollection.prototype.localStorage = new Backbone.LocalStorage(API.localKey);

    return LocalNavMainCollection;

  })(App.Entities.Collection);
  App.reqres.setHandler("navMain:entities", function(parent) {
    var parentId;
    if (parent == null) {
      parent = 'all';
    }
    if (parent === 'all') {
      return API.getStructure();
    } else {
      parentId = API.getIdfromPath(parent);
      return API.getChildStructure(parentId);
    }
  });
  App.reqres.setHandler("navMain:array:entities", function(items) {
    var i, item;
    for (i in items) {
      item = items[i];
      items[i].id = item.path;
    }
    return new Entities.NavMainCollection(items);
  });
  App.reqres.setHandler("navMain:update:entities", function(items) {
    return API.saveLocal(items);
  });
  return App.reqres.setHandler("navMain:update:defaults", function(items) {
    return API.clearLocal();
  });
});

this.Kodi.module("Entities", function(Entities, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    localKey: 'searchAddons',
    getLocalCollection: function() {
      var collection;
      collection = new Entities.LocalSearchAddonsCollection([], {
        key: this.localKey
      });
      collection.fetch();
      return collection;
    },
    saveLocal: function(items) {
      var collection, i, item;
      collection = this.clearLocal();
      for (i in items) {
        item = items[i];
        collection.create(item);
      }
      return collection;
    },
    clearLocal: function() {
      var collection, model;
      collection = this.getLocalCollection();
      while (model = collection.first()) {
        model.destroy();
      }
      return collection;
    }
  };
  Entities.SearchAddons = (function(superClass) {
    extend(SearchAddons, superClass);

    function SearchAddons() {
      return SearchAddons.__super__.constructor.apply(this, arguments);
    }

    SearchAddons.prototype.defaults = {
      id: '',
      url: '',
      title: 'Untitled',
      media: 'music'
    };

    return SearchAddons;

  })(App.Entities.Model);
  Entities.LocalSearchAddonsCollection = (function(superClass) {
    extend(LocalSearchAddonsCollection, superClass);

    function LocalSearchAddonsCollection() {
      return LocalSearchAddonsCollection.__super__.constructor.apply(this, arguments);
    }

    LocalSearchAddonsCollection.prototype.model = Entities.SearchAddons;

    LocalSearchAddonsCollection.prototype.localStorage = new Backbone.LocalStorage(API.localKey);

    return LocalSearchAddonsCollection;

  })(App.Entities.Collection);
  App.reqres.setHandler("searchAddons:entities", function(items) {
    return API.getLocalCollection();
  });
  App.reqres.setHandler("searchAddons:update:entities", function(items) {
    return API.saveLocal(items);
  });
  return App.reqres.setHandler("searchAddons:update:defaults", function() {
    return API.clearLocal();
  });
});

this.Kodi.module("Controllers", function(Controllers, App, Backbone, Marionette, $, _) {
  return Controllers.Base = (function(superClass) {
    extend(Base, superClass);

    Base.prototype.params = {};

    function Base(options) {
      if (options == null) {
        options = {};
      }
      Base.__super__.constructor.call(this, options);
      this.region = options.region || App.request("default:region");
      this.params = helpers.url.params();
      this._instance_id = _.uniqueId("controller");
      App.execute("register:instance", this, this._instance_id);
    }

    Base.prototype.close = function() {
      var args;
      args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
      delete this.region;
      delete this.options;
      Base.__super__.close.call(this, args);
      return App.execute("unregister:instance", this, this._instance_id);
    };

    Base.prototype.show = function(view) {
      this.listenTo(view, "close", this.close);
      return this.region.show(view);
    };

    return Base;

  })(Backbone.Marionette.Controller);
});

this.Kodi.module("Router", function(Router, App, Backbone, Marionette, $, _) {
  return Router.Base = (function(superClass) {
    extend(Base, superClass);

    function Base() {
      return Base.__super__.constructor.apply(this, arguments);
    }

    Base.prototype.before = function(route, params) {
      App.execute("loading:show:page");
      return App.execute("selected:clear:items");
    };

    Base.prototype.after = function(route, params) {
      return this.setBodyClasses();
    };

    Base.prototype.setBodyClasses = function() {
      var $body, section;
      $body = App.getRegion('root').$el;
      $body.removeClassRegex(/^section-/);
      $body.removeClassRegex(/^page-/);
      section = helpers.url.arg(0);
      if (section === '') {
        section = 'home';
      }
      $body.addClass('section-' + section);
      return $body.addClass('page-' + helpers.url.arg().join('-'));
    };

    return Base;

  })(Marionette.AppRouter);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  return Views.CollectionView = (function(superClass) {
    extend(CollectionView, superClass);

    function CollectionView() {
      return CollectionView.__super__.constructor.apply(this, arguments);
    }

    CollectionView.prototype.itemViewEventPrefix = "childview";

    CollectionView.prototype.onShow = function() {
      return $("img.lazy").lazyload({
        threshold: 200
      });
    };

    return CollectionView;

  })(Backbone.Marionette.CollectionView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  return Views.CompositeView = (function(superClass) {
    extend(CompositeView, superClass);

    function CompositeView() {
      return CompositeView.__super__.constructor.apply(this, arguments);
    }

    CompositeView.prototype.itemViewEventPrefix = "childview";

    return CompositeView;

  })(Backbone.Marionette.CompositeView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  return Views.ItemView = (function(superClass) {
    extend(ItemView, superClass);

    function ItemView() {
      return ItemView.__super__.constructor.apply(this, arguments);
    }

    ItemView.prototype.onShow = function() {
      return this.menuBlur();
    };

    ItemView.prototype.menuBlur = function() {
      $('.dropdown', this.$el).on('show.bs.dropdown', (function(_this) {
        return function() {
          return _this.$el.addClass('menu-open');
        };
      })(this));
      $('.dropdown', this.$el).on('hide.bs.dropdown', (function(_this) {
        return function() {
          return _this.$el.removeClass('menu-open');
        };
      })(this));
      return $('.dropdown', this.$el).on('click', function() {
        return $(this).removeClass('open').trigger('hide.bs.dropdown');
      });
    };

    ItemView.prototype.toggleWatched = function(e) {
      return this.trigger("toggle:watched", {
        view: this
      });
    };

    ItemView.prototype.watchedAttributes = function(baseClass) {
      var classes;
      if (baseClass == null) {
        baseClass = '';
      }
      classes = [baseClass];
      if (App.request("thumbsup:check", this.model)) {
        classes.push('thumbs-up');
      }
      if (helpers.entities.isWatched(this.model)) {
        classes.push('is-watched');
      }
      return {
        "class": classes.join(' ')
      };
    };

    ItemView.prototype.toggleSelect = function(e) {
      var op;
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        if (!this.$el.hasClass('prevent-select') && helpers.url.arg(0) !== 'thumbsup') {
          this.$el.toggleClass('selected');
          op = this.$el.hasClass('selected') ? 'add' : 'remove';
          return App.execute("selected:update:items", op, this.model.toJSON());
        }
      }
    };

    return ItemView;

  })(Backbone.Marionette.ItemView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  return Views.LayoutView = (function(superClass) {
    extend(LayoutView, superClass);

    function LayoutView() {
      return LayoutView.__super__.constructor.apply(this, arguments);
    }

    LayoutView.prototype.onShow = function() {
      return App.execute("ui:dropdown:bind:close", this.$el);
    };

    return LayoutView;

  })(Backbone.Marionette.LayoutView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  var _remove;
  _remove = Marionette.View.prototype.remove;
  return _.extend(Marionette.View.prototype, {
    themeLink: function(name, url, options) {
      var attrs;
      if (options == null) {
        options = {};
      }
      _.defaults(options, {
        external: false,
        className: ''
      });
      attrs = {};
      if (options.external) {
        attrs.target = '_blank';
        attrs.href = url;
      } else {
        attrs.href = '#' + url;
      }
      if (options.className !== '') {
        attrs["class"] = options.className;
      }
      return $("<a>").attr(attrs).text(name).wrap('<div/>').parent().html();
    },
    themeTag: function(el, attrs, value) {
      return $("<" + el + ">").attr(attrs).html(value).wrap('<div/>').parent().html();
    },
    formatText: function(text, addInLineBreaks) {
      var res;
      if (addInLineBreaks == null) {
        addInLineBreaks = false;
      }
      res = XBBCODE.process({
        text: text,
        removeMisalignedTags: true,
        addInLineBreaks: addInLineBreaks
      });
      if (res.error === !false) {
        helpers.debug.msg('formatText error: ' + res.errorQueue.join(', '), 'warning', res);
      }
      return res.html;
    },
    populateMenu: function(type) {
      var baseSelector, key, menu, ref, selector, val;
      if (type == null) {
        type = '';
      }
      menu = '';
      baseSelector = 'dropdown-menu';
      if (this.model.get('menu')) {
        ref = this.model.get('menu');
        for (key in ref) {
          val = ref[key];
          if (key.lastIndexOf('divider', 0) === 0) {
            key = 'divider';
          }
          menu += this.themeTag('li', {
            "class": key
          }, val);
        }
        selector = type !== '' ? type + ' .' + baseSelector : baseSelector;
        return this.$el.find('.' + selector).html(menu);
      }
    },
    populateModelMenu: function() {
      return this.populateMenu();
    },
    populateSetMenu: function() {
      return this.populateMenu('set__actions');
    }
  });
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  return Views.VirtualListView = (function(superClass) {
    extend(VirtualListView, superClass);

    function VirtualListView() {
      return VirtualListView.__super__.constructor.apply(this, arguments);
    }

    VirtualListView.prototype.originalCollection = {};

    VirtualListView.prototype.preload = 20;

    VirtualListView.prototype.originalChildView = {};

    VirtualListView.prototype.buffer = 30;

    VirtualListView.prototype.cardSelector = '.card';

    VirtualListView.prototype.animateFrameTrigger = "ui:animate:stop";

    VirtualListView.prototype.placeHolderViewName = 'CardViewPlaceholder';

    VirtualListView.prototype.addChild = function(child, ChildView, index) {
      if (index > this.preload) {
        ChildView = App.Views[this.placeHolderViewName];
      }
      return Backbone.Marionette.CollectionView.prototype.addChild.apply(this, arguments);
    };

    VirtualListView.prototype.initialize = function() {
      this.originalChildView = this.getOption('childView');
      this.placeholderChildView = App.Views[this.placeHolderViewName];
      return App.vent.on(this.animateFrameTrigger, (function(_this) {
        return function() {
          return _this.renderItemsInViewport();
        };
      })(this));
    };

    VirtualListView.prototype.onRender = function() {
      return this.renderItemsInViewport();
    };

    VirtualListView.prototype.renderItemsInViewport = function() {
      var $cards, max, min, n, results1, visibleIndexes, visibleRange;
      $cards = $(this.cardSelector, this.$el);
      visibleIndexes = [];
      $cards.each((function(_this) {
        return function(i, d) {
          if ($cards.length <= _this.preload || $(d).visible(true)) {
            return visibleIndexes.push(i);
          }
        };
      })(this));
      visibleRange = [];
      if (visibleIndexes.length > 0) {
        min = _.min(visibleIndexes);
        max = _.max(visibleIndexes);
        min = (min - this.buffer) < 0 ? 0 : min - this.buffer;
        max = (max + this.buffer) >= $cards.length ? $cards.length - 1 : max + this.buffer;
        visibleRange = (function() {
          results1 = [];
          for (var n = min; min <= max ? n <= max : n >= max; min <= max ? n++ : n--){ results1.push(n); }
          return results1;
        }).apply(this);
      }
      return $cards.each((function(_this) {
        return function(i, d) {
          if ($(d).hasClass('ph') && helpers.global.inArray(i, visibleRange)) {
            return $(d).replaceWith(_this.getRenderedChildView($(d).data('model'), _this.originalChildView, i));
          } else if (!$(d).hasClass('ph') && !helpers.global.inArray(i, visibleRange)) {
            return $(d).replaceWith(_this.getRenderedChildView($(d).data('model'), _this.placeholderChildView, i));
          }
        };
      })(this));
    };

    VirtualListView.prototype.getRenderedChildView = function(child, ChildView, index) {
      var childViewOptions, view;
      childViewOptions = this.getOption('childViewOptions');
      childViewOptions = Marionette._getValue(childViewOptions, this, [child, index]);
      view = this.buildChildView(child, ChildView, childViewOptions);
      this.proxyChildEvents(view);
      return view.render().$el;
    };

    VirtualListView.prototype.events = {
      "click a": "storeScroll"
    };

    VirtualListView.prototype.storeScroll = function() {
      return helpers.backscroll.setLast();
    };

    VirtualListView.prototype.onShow = function() {
      return helpers.backscroll.scrollToLast();
    };

    return VirtualListView;

  })(Views.CollectionView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  Views.CardView = (function(superClass) {
    extend(CardView, superClass);

    function CardView() {
      return CardView.__super__.constructor.apply(this, arguments);
    }

    CardView.prototype.template = "views/card/card";

    CardView.prototype.tagName = "li";

    CardView.prototype.events = {
      "click .dropdown > i": "populateModelMenu",
      "click .thumbs": "toggleThumbs",
      "click": "toggleSelect"
    };

    CardView.prototype.modelEvents = {
      'change': 'modelChange'
    };

    CardView.prototype.toggleThumbs = function() {
      App.request("thumbsup:toggle:entity", this.model);
      return this.$el.toggleClass('thumbs-up');
    };

    CardView.prototype.attributes = function() {
      var classes;
      classes = ['card', 'card-loaded'];
      if (App.request("thumbsup:check", this.model)) {
        classes.push('thumbs-up');
      }
      return {
        "class": classes.join(' ')
      };
    };

    CardView.prototype.onBeforeRender = function() {
      if (this.model.get('labelHtml') == null) {
        this.model.set('labelHtml', this.model.escape('label'));
      }
      if (this.model.get('subtitleHtml') == null) {
        return this.model.set('subtitleHtml', this.model.escape('subtitle'));
      }
    };

    CardView.prototype.onRender = function() {
      return this.$el.data('model', this.model);
    };

    CardView.prototype.onShow = function() {
      return $('.dropdown', this.$el).on('click', function() {
        return $(this).removeClass('open').trigger('hide.bs.dropdown');
      });
    };

    CardView.prototype.makeLinksExternal = function() {
      return $('.title, .thumb', this.$el).attr('href', this.model.get('url')).attr('target', '_blank');
    };

    CardView.prototype.modelChange = function() {
      if (_.isFunction(this.setMeta)) {
        this.setMeta();
      }
      return this.render();
    };

    return CardView;

  })(App.Views.ItemView);
  return Views.CardViewPlaceholder = (function(superClass) {
    extend(CardViewPlaceholder, superClass);

    function CardViewPlaceholder() {
      return CardViewPlaceholder.__super__.constructor.apply(this, arguments);
    }

    CardViewPlaceholder.prototype.template = "views/card/card_placeholder";

    CardViewPlaceholder.prototype.attributes = function() {
      return {
        "class": 'card ph'
      };
    };

    CardViewPlaceholder.prototype.onRender = function() {
      return this.$el.data('model', this.model);
    };

    return CardViewPlaceholder;

  })(App.Views.ItemView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  return Views.DetailsItem = (function(superClass) {
    extend(DetailsItem, superClass);

    function DetailsItem() {
      return DetailsItem.__super__.constructor.apply(this, arguments);
    }

    DetailsItem.prototype.events = {
      "click .watched": "toggleWatched",
      "click .internal-search li": "internalSearch",
      "click .external-search li": "externalSearch",
      "click .youtube-search": "youtubeSearch"
    };

    DetailsItem.prototype.modelEvents = {
      'change': 'modelChange'
    };

    DetailsItem.prototype.modelChange = function() {
      return this.render();
    };

    DetailsItem.prototype.onRender = function() {
      if (this.model.get('fanart')) {
        this.$el.closest('.detail-container').find('.region-details-fanart').css('background-image', 'url(' + this.model.get('fanart') + ')');
      }
      return $('.description', this.$el).attr('title', tr('Click for more')).on('click', function(e) {
        return $(this).toggleClass('expanded');
      });
    };

    DetailsItem.prototype.internalSearch = function(e) {
      var $li;
      $li = $(e.target);
      return App.execute('search:go', 'internal', $li.data('query'), $li.data('type'));
    };

    DetailsItem.prototype.externalSearch = function(e) {
      var $li;
      $li = $(e.target);
      return App.execute('search:go', 'external', $li.data('query'), $li.data('type'));
    };

    DetailsItem.prototype.youtubeSearch = function(e) {
      var $li;
      $li = $(e.target);
      return App.execute("youtube:search:popup", $li.data('query'));
    };

    return DetailsItem;

  })(App.Views.ItemView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  Views.EmptyViewPage = (function(superClass) {
    extend(EmptyViewPage, superClass);

    function EmptyViewPage() {
      return EmptyViewPage.__super__.constructor.apply(this, arguments);
    }

    EmptyViewPage.prototype.template = "views/empty/empty_page";

    EmptyViewPage.prototype.regions = {
      regionEmptyContent: ".empty--page"
    };

    return EmptyViewPage;

  })(App.Views.ItemView);
  return Views.EmptyViewResults = (function(superClass) {
    extend(EmptyViewResults, superClass);

    function EmptyViewResults() {
      return EmptyViewResults.__super__.constructor.apply(this, arguments);
    }

    EmptyViewResults.prototype.template = "views/empty/empty_results";

    EmptyViewResults.prototype.regions = {
      regionEmptyContent: ".empty-result"
    };

    EmptyViewResults.prototype.onRender = function() {
      if (this.options && this.options.emptyKey) {
        $('.empty-key', this.$el).text(tr(this.options.emptyKey));
      }
      if (this.options && this.options.emptyBackUrl) {
        return $('.back-link', this.$el).html(this.themeLink(tr('Go back'), this.options.emptyBackUrl));
      }
    };

    return EmptyViewResults;

  })(App.Views.ItemView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  Views.LayoutWithSidebarFirstView = (function(superClass) {
    extend(LayoutWithSidebarFirstView, superClass);

    function LayoutWithSidebarFirstView() {
      return LayoutWithSidebarFirstView.__super__.constructor.apply(this, arguments);
    }

    LayoutWithSidebarFirstView.prototype.template = "views/layouts/layout_with_sidebar_first";

    LayoutWithSidebarFirstView.prototype.regions = {
      regionSidebarFirst: ".region-first-primary",
      regionContent: ".region-content"
    };

    LayoutWithSidebarFirstView.prototype.events = {
      "click .region-first-toggle": "toggleRegionFirst"
    };

    LayoutWithSidebarFirstView.prototype.toggleRegionFirst = function() {
      return this.$el.toggleClass('region-first-open');
    };

    LayoutWithSidebarFirstView.prototype.appendSidebarView = function(viewId, appendView) {
      $('.region-first-secondary', this.$el).append('<div id="' + viewId + '">');
      this.regionManager.addRegion(viewId, '#' + viewId);
      return this[viewId].show(appendView);
    };

    return LayoutWithSidebarFirstView;

  })(App.Views.LayoutView);
  Views.LayoutWithHeaderView = (function(superClass) {
    extend(LayoutWithHeaderView, superClass);

    function LayoutWithHeaderView() {
      return LayoutWithHeaderView.__super__.constructor.apply(this, arguments);
    }

    LayoutWithHeaderView.prototype.template = "views/layouts/layout_with_header";

    LayoutWithHeaderView.prototype.regions = {
      regionHeader: ".region-header",
      regionContentTop: ".region-content-top",
      regionContent: ".region-content"
    };

    return LayoutWithHeaderView;

  })(App.Views.LayoutView);
  return Views.LayoutDetailsHeaderView = (function(superClass) {
    extend(LayoutDetailsHeaderView, superClass);

    function LayoutDetailsHeaderView() {
      return LayoutDetailsHeaderView.__super__.constructor.apply(this, arguments);
    }

    LayoutDetailsHeaderView.prototype.template = "views/layouts/layout_details_header";

    LayoutDetailsHeaderView.prototype.regions = {
      regionSide: ".region-details-side",
      regionTitle: ".region-details-title",
      regionMeta: ".region-details-meta",
      regionMetaSideFirst: ".region-details-meta-side-first",
      regionMetaSideSecond: ".region-details-meta-side-second",
      regionMetaBelow: ".region-details-meta-below",
      regionFanart: ".region-details-fanart"
    };

    LayoutDetailsHeaderView.prototype.onRender = function() {
      return helpers.ui.getSwatch(this.model.get('thumbnail'), function(swatches) {
        return helpers.ui.applyHeaderSwatch(swatches);
      });
    };

    LayoutDetailsHeaderView.prototype.initialize = function() {
      if (!this.model.get('progress')) {
        return this.model.set({
          progress: 0
        });
      }
    };

    return LayoutDetailsHeaderView;

  })(App.Views.LayoutView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    createModel: function(options) {
      var defaultMenu, model;
      if (options == null) {
        options = {};
      }
      defaultMenu = {
        selectall: tr('Toggle select all')
      };
      model = _.extend({
        childViewTag: 'div',
        ChildViewClass: ''
      }, options);
      if (!options.noMenuDefault) {
        model.menu = _.isObject(options.menu) ? _.extend(defaultMenu, options.menu) : defaultMenu;
      }
      return new Backbone.Model(model);
    },
    toggleSelectAll: function($el) {
      var $ctx;
      $ctx = $('.set__collection', $el);
      return $('.card, .song', $ctx).toggleClass('selected').each(function(i, d) {
        var $d, op;
        $d = $(d);
        op = $(d).hasClass('selected') ? 'add' : 'remove';
        return App.execute("selected:update:items", op, $d.data('model').toJSON());
      });
    }
  };
  Views.SetCompositeView = (function(superClass) {
    extend(SetCompositeView, superClass);

    function SetCompositeView() {
      return SetCompositeView.__super__.constructor.apply(this, arguments);
    }

    SetCompositeView.prototype.template = 'views/set/set';

    SetCompositeView.prototype.childView = App.Views.CardView;

    SetCompositeView.prototype.tagName = 'div';

    SetCompositeView.prototype.className = "set__wrapper";

    SetCompositeView.prototype.childViewContainer = ".set__collection";

    SetCompositeView.prototype.events = {
      "click .dropdown > i": "populateSetMenu",
      "click .selectall": "toggleSelectAll"
    };

    SetCompositeView.prototype.initialize = function() {
      return this.createModel();
    };

    SetCompositeView.prototype.createModel = function() {
      return this.model = API.createModel(this.options);
    };

    SetCompositeView.prototype.toggleSelectAll = function() {
      return API.toggleSelectAll(this.$el);
    };

    return SetCompositeView;

  })(App.Views.CompositeView);
  return Views.SetLayoutView = (function(superClass) {
    extend(SetLayoutView, superClass);

    function SetLayoutView() {
      return SetLayoutView.__super__.constructor.apply(this, arguments);
    }

    SetLayoutView.prototype.template = 'views/set/set';

    SetLayoutView.prototype.tagName = 'div';

    SetLayoutView.prototype.className = "set__wrapper";

    SetLayoutView.prototype.regions = {
      regionCollection: ".set__collection"
    };

    SetLayoutView.prototype.events = {
      "click .dropdown > i": "populateSetMenu",
      "click .selectall": "toggleSelectAll"
    };

    SetLayoutView.prototype.initialize = function() {
      return this.createModel();
    };

    SetLayoutView.prototype.createModel = function() {
      return this.model = API.createModel(this.options);
    };

    SetLayoutView.prototype.toggleSelectAll = function() {
      return API.toggleSelectAll(this.$el);
    };

    return SetLayoutView;

  })(App.Views.LayoutView);
});

this.Kodi.module("Views", function(Views, App, Backbone, Marionette, $, _) {
  return Views.SongViewPlaceholder = (function(superClass) {
    extend(SongViewPlaceholder, superClass);

    function SongViewPlaceholder() {
      return SongViewPlaceholder.__super__.constructor.apply(this, arguments);
    }

    SongViewPlaceholder.prototype.template = "views/song/song_placeholder";

    SongViewPlaceholder.prototype.tagName = 'tr';

    SongViewPlaceholder.prototype.attributes = function() {
      return {
        "class": 'song ph'
      };
    };

    SongViewPlaceholder.prototype.onRender = function() {
      return this.$el.data('model', this.model);
    };

    return SongViewPlaceholder;

  })(App.Views.ItemView);
});

this.Kodi.module("Components.Form", function(Form, App, Backbone, Marionette, $, _) {
  Form.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var config;
      if (options == null) {
        options = {};
      }
      config = options.config ? options.config : {};
      this.formLayout = this.getFormLayout(config);
      this.listenTo(this.formLayout, "show", (function(_this) {
        return function() {
          _this.formBuild(options.form, options.formState, config);
          $.material.init();
          if (config && typeof config.onShow === 'function') {
            return config.onShow(options);
          }
        };
      })(this));
      this.listenTo(this.formLayout, "form:submit", (function(_this) {
        return function() {
          return _this.formSubmit(options);
        };
      })(this));
      return this;
    };

    Controller.prototype.formSubmit = function(options) {
      var data;
      data = Backbone.Syphon.serialize(this.formLayout);
      data = App.request("form:value:entities", options.form, data);
      return this.processFormSubmit(data, options);
    };

    Controller.prototype.processFormSubmit = function(data, options) {
      if (options.config && typeof options.config.callback === 'function') {
        return options.config.callback(data, this.formLayout);
      }
    };

    Controller.prototype.getFormLayout = function(options) {
      if (options == null) {
        options = {};
      }
      return new Form.FormWrapper({
        config: options
      });
    };

    Controller.prototype.formBuild = function(form, formState, options) {
      var buildView, collection;
      if (form == null) {
        form = [];
      }
      if (formState == null) {
        formState = {};
      }
      if (options == null) {
        options = {};
      }
      collection = App.request("form:item:entities", form, formState);
      buildView = new Form.Groups({
        collection: collection
      });
      return this.formLayout.formContentRegion.show(buildView);
    };

    return Controller;

  })(App.Controllers.Base);
  App.reqres.setHandler("form:render:items", function(form, formState, options) {
    var collection;
    if (options == null) {
      options = {};
    }
    collection = App.request("form:item:entities", form, formState);
    return new Form.Groups({
      collection: collection
    });
  });
  App.reqres.setHandler("form:wrapper", function(options) {
    var formController;
    if (options == null) {
      options = {};
    }
    formController = new Form.Controller(options);
    return formController.formLayout;
  });
  return App.reqres.setHandler("form:popup:wrapper", function(options) {
    var formContent, formController, originalCallback, popupStyle, ref, titleHtml;
    if (options == null) {
      options = {};
    }
    originalCallback = options.config.callback;
    options.config.callback = function(data, layout) {
      App.execute("ui:modal:close");
      return originalCallback(data, layout);
    };
    formController = new Form.Controller(options);
    formContent = formController.formLayout.render().$el;
    formController.formLayout.trigger('show');
    popupStyle = options.config.editForm ? 'edit-form' : 'form';
    titleHtml = (ref = options.titleHtml) != null ? ref : _.escape(options.title);
    return App.execute("ui:modal:form:show", titleHtml, formContent, popupStyle);
  });
});

this.Kodi.module("Components.Form", function(Form, App, Backbone, Marionette, $, _) {
  Form.FormWrapper = (function(superClass) {
    extend(FormWrapper, superClass);

    function FormWrapper() {
      return FormWrapper.__super__.constructor.apply(this, arguments);
    }

    FormWrapper.prototype.template = "components/form/form";

    FormWrapper.prototype.tagName = "form";

    FormWrapper.prototype.regions = {
      formContentRegion: ".form-content-region",
      formResponse: ".response"
    };

    FormWrapper.prototype.triggers = {
      "click .form-save": "form:submit",
      "click [data-form-button='cancel']": "form:cancel"
    };

    FormWrapper.prototype.modelEvents = {
      "change:_errors": "changeErrors",
      "sync:start": "syncStart",
      "sync:stop": "syncStop"
    };

    FormWrapper.prototype.initialize = function() {
      this.config = this.options.config;
      return this.on("form:save", (function(_this) {
        return function(msg) {
          return _this.addSuccessMsg(msg);
        };
      })(this));
    };

    FormWrapper.prototype.attributes = function() {
      var attrs;
      attrs = {
        "class": 'component-form'
      };
      if (this.options.config && this.options.config.attributes) {
        attrs = _.extend(attrs, this.options.config.attributes);
      }
      return attrs;
    };

    FormWrapper.prototype.onRender = function() {
      return _.defer((function(_this) {
        return function() {
          if (_this.config.focusFirstInput) {
            _this.focusFirstInput();
          }
          $('.btn').ripples({
            color: 'rgba(255,255,255,0.1)'
          });
          App.vent.trigger("form:onshow", _this.config);
          $('.form-item .form-button', _this.$el).on('click', function(e) {
            e.preventDefault();
            if ($(this).data('trigger')) {
              return App.execute($(this).data('trigger'));
            }
          });
          if (_this.config.tabs) {
            return _this.makeTabs(_this.$el);
          }
        };
      })(this));
    };

    FormWrapper.prototype.focusFirstInput = function() {
      return this.$(":input:visible:enabled:first").focus();
    };

    FormWrapper.prototype.changeErrors = function(model, errors, options) {
      if (this.config.errors) {
        if (_.isEmpty(errors)) {
          return this.removeErrors();
        } else {
          return this.addErrors(errors);
        }
      }
    };

    FormWrapper.prototype.removeErrors = function() {
      return this.$(".error").removeClass("error").find("small").remove();
    };

    FormWrapper.prototype.addErrors = function(errors) {
      var array, name, results1;
      if (errors == null) {
        errors = {};
      }
      results1 = [];
      for (name in errors) {
        array = errors[name];
        results1.push(this.addError(name, array[0]));
      }
      return results1;
    };

    FormWrapper.prototype.addError = function(name, error) {
      var el, sm;
      el = this.$("[name='" + name + "']");
      sm = $("<small>").text(error);
      return el.after(sm).closest(".row").addClass("error");
    };

    FormWrapper.prototype.addSuccessMsg = function(msg) {
      var $el;
      $el = $(".response", this.$el);
      $el.text(msg).show();
      return setTimeout((function() {
        return $el.fadeOut();
      }), 5000);
    };

    FormWrapper.prototype.makeTabs = function($ctx) {
      var $tabs;
      $tabs = $('<ul>').addClass('form-tabs');
      $('.group-title', $ctx).each(function(i, d) {
        return $('<li>').html($(d).html()).click(function(e) {
          $('.group-parent').hide();
          $(d).closest('.group-parent').show();
          $(e.target).closest('.form-tabs').find('li').removeClass('active');
          return $(e.target).addClass('active');
        }).appendTo($tabs);
      });
      $('.form-groups', $ctx).before($tabs);
      $tabs.find('li').first().trigger('click');
      return $ctx.addClass('with-tabs');
    };

    return FormWrapper;

  })(App.Views.LayoutView);
  Form.Item = (function(superClass) {
    extend(Item, superClass);

    function Item() {
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.prototype.template = 'components/form/form_item';

    Item.prototype.tagName = 'div';

    Item.prototype.initialize = function() {
      var attrs, baseAttrs, el, inputType, key, materialBaseAttrs, name, options, ref, textfields, val, value;
      name = this.model.get('name') ? this.model.get('name') : this.model.get('id');
      baseAttrs = _.extend({
        id: 'form-edit-' + this.model.get('id'),
        name: name,
        "class": ''
      }, this.model.get('attributes'));
      materialBaseAttrs = _.extend({}, baseAttrs);
      materialBaseAttrs["class"] += ' form-control';
      if (this.model.get('titleHtml') == null) {
        this.model.set('titleHtml', this.model.escape('title'));
      }
      switch (this.model.get('type')) {
        case 'checkbox':
          attrs = {
            type: 'checkbox',
            value: 1,
            "class": 'form-checkbox'
          };
          if (this.model.get('defaultValue') === true) {
            attrs.checked = 'checked';
          }
          el = this.themeTag('input', _.extend(baseAttrs, attrs), '');
          break;
        case 'textfield':
        case 'number':
        case 'date':
        case 'imageselect':
          textfields = ['textfield', 'imageselect'];
          inputType = helpers.global.inArray(this.model.get('type'), textfields) ? 'text' : this.model.get('type');
          attrs = {
            type: inputType,
            value: this.model.get('defaultValue')
          };
          el = this.themeTag('input', _.extend(materialBaseAttrs, attrs), '');
          break;
        case 'hidden':
          attrs = {
            type: 'hidden',
            value: this.model.get('defaultValue'),
            "class": 'form-hidden'
          };
          el = this.themeTag('input', _.extend(baseAttrs, attrs), '');
          break;
        case 'button':
          attrs = {
            "class": 'form-button btn btn-secondary'
          };
          if (this.model.get('trigger')) {
            attrs['data-trigger'] = this.model.get('trigger');
          }
          el = this.themeTag('button', _.extend(baseAttrs, attrs), this.model.get('value'));
          break;
        case 'textarea':
          el = this.themeTag('textarea', materialBaseAttrs, this.model.get('defaultValue'));
          break;
        case 'markup':
          attrs = {
            "class": 'form-markup'
          };
          el = this.themeTag('div', attrs, this.model.get('markup'));
          break;
        case 'select':
          options = '';
          ref = this.model.get('options');
          for (key in ref) {
            val = ref[key];
            attrs = {
              value: key
            };
            value = this.model.get('defaultValue');
            if (String(value) === String(key)) {
              attrs.selected = 'selected';
            }
            options += this.themeTag('option', attrs, val);
          }
          el = this.themeTag('select', _.extend(baseAttrs, {
            "class": 'form-control'
          }), options);
          break;
        default:
          el = null;
      }
      if (el) {
        return this.model.set({
          element: el
        });
      }
    };

    Item.prototype.attributes = function() {
      var elAttrs, elClasses;
      elClasses = [];
      elAttrs = this.model.get('attributes');
      if (elAttrs["class"]) {
        elClasses = _.map(elAttrs["class"].split(' '), function(c) {
          return 'form-item-' + c;
        });
      }
      return {
        "class": 'form-item form-group form-type-' + this.model.get('type') + ' form-edit-' + this.model.get('id') + ' ' + elClasses.join(' ')
      };
    };

    Item.prototype.onRender = function() {
      return _.defer((function(_this) {
        return function() {
          if (_this.model.get('prefix')) {
            _this.$el.before(_this.model.get('prefix'));
          }
          if (_this.model.get('suffix')) {
            return _this.$el.after(_this.model.get('suffix'));
          }
        };
      })(this));
    };

    return Item;

  })(App.Views.ItemView);
  Form.Group = (function(superClass) {
    extend(Group, superClass);

    function Group() {
      return Group.__super__.constructor.apply(this, arguments);
    }

    Group.prototype.template = 'components/form/form_item_group';

    Group.prototype.tagName = 'div';

    Group.prototype.childViewContainer = '.form-items';

    Group.prototype.getChildView = function(item) {
      if (item.get('type') === 'imageselect') {
        return Form.ItemImageSelect;
      } else {
        return Form.Item;
      }
    };

    Group.prototype.attributes = function() {
      return {
        "class": 'form-group group-parent ' + this.model.get('class')
      };
    };

    Group.prototype.initialize = function() {
      var children;
      children = this.model.get('children');
      if (children.length === 0) {
        return this.model.set('title', '');
      } else {
        return this.collection = children;
      }
    };

    return Group;

  })(App.Views.CompositeView);
  Form.Groups = (function(superClass) {
    extend(Groups, superClass);

    function Groups() {
      return Groups.__super__.constructor.apply(this, arguments);
    }

    Groups.prototype.childView = Form.Group;

    Groups.prototype.className = 'form-groups';

    return Groups;

  })(App.Views.CollectionView);

  /*
    Custom Widgets that extend Form.Item
   */
  return Form.ItemImageSelect = (function(superClass) {
    extend(ItemImageSelect, superClass);

    function ItemImageSelect() {
      return ItemImageSelect.__super__.constructor.apply(this, arguments);
    }

    ItemImageSelect.prototype.template = 'components/form/form_item_imageselect';

    ItemImageSelect.prototype.initialize = function() {
      var thumb;
      ItemImageSelect.__super__.initialize.apply(this, arguments);
      thumb = App.request("images:path:get", this.model.get('defaultValue'), this.model.get('id'));
      return this.model.set({
        image: {
          original: this.model.get('defaultValue'),
          thumb: thumb
        }
      });
    };

    ItemImageSelect.prototype.onRender = function() {
      var $input, $panes, $tabs, $thumbs, $wrapper, field, item, metadataHandler, metadataLookup;
      item = this.model.get('formState');
      field = this.model.get('id');
      metadataHandler = this.model.get('metadataImageHandler');
      metadataLookup = this.model.get('metadataLookupField');
      $wrapper = $('.form-imageselect', this.$el);
      $thumbs = $('.form-imageselect__thumbs', this.$el);
      $input = $('.form-imageselect__url input', this.$el);
      $tabs = $('.form-imageselect__tabs', this.$el);
      $panes = $('.form-imageselect__panes', this.$el);
      $tabs.on('click', 'li', function(e) {
        $tabs.find('li').removeClass('active');
        $(this).addClass('active');
        $panes.find('.pane').removeClass('active');
        return $panes.find('.pane[rel=' + $(this).data('pane') + ']').addClass('active');
      });
      $thumbs.on('click', 'li', function(e) {
        $thumbs.find('li').removeClass('selected');
        return $input.val($(this).addClass('selected').data('original'));
      });
      return _.defer(function() {
        if (metadataHandler && metadataLookup && item[metadataLookup]) {
          $wrapper.addClass('images-loading');
          return App.execute(metadataHandler, item[metadataLookup], function(collection) {
            var image, len, n, ref;
            ref = collection.where({
              type: field
            });
            for (n = 0, len = ref.length; n < len; n++) {
              image = ref[n];
              $('<li>').data('original', image.get('url')).css('background-image', 'url(' + image.get('thumbnail') + ')').attr('title', image.get('title')).appendTo($thumbs);
            }
            return $wrapper.removeClass('images-loading');
          });
        }
      });
    };

    return ItemImageSelect;

  })(Form.Item);
});

this.Kodi.module("AddonApp", function(AddonApp, App, Backbone, Marionette, $, _) {
  var API;
  AddonApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "addons/:type": "list",
      "addon/execute/:id": "execute"
    };

    return Router;

  })(App.Router.Base);
  API = {
    list: function(type) {
      return new AddonApp.List.Controller({
        type: type
      });
    },
    execute: function(id) {
      API.addonController().executeAddon(id, helpers.url.params(), function() {
        return Kodi.execute("notification:show", tr('Executed addon'));
      });
      return App.navigate("addons/executable", {
        trigger: true
      });
    },
    addonController: function() {
      return App.request("command:kodi:controller", 'auto', 'AddOn');
    },
    getEnabledAddons: function(callback) {
      var addons;
      addons = [];
      if (config.getLocal("addOnsLoaded", false) === true) {
        addons = config.getLocal("addOnsEnabled", []);
        if (callback) {
          callback(addons);
        }
      } else {
        this.addonController().getEnabledAddons(true, function(addons) {
          config.setLocal("addOnsEnabled", addons);
          config.setLocal("addOnsLoaded", true);
          config.set('app', "addOnsSearchSettings", API.getSearchSettings(addons));
          if (callback) {
            return callback(addons);
          }
        });
      }
      return addons;
    },
    getSearchSettings: function(addons) {
      var addon, i, len, n, searchSetting, searchSettings, set;
      searchSettings = [];
      for (n = 0, len = addons.length; n < len; n++) {
        addon = addons[n];
        searchSetting = App.request("addon:search:settings:" + addon.addonid);
        if (searchSetting) {
          if (!_.isArray(searchSetting)) {
            searchSetting = [searchSetting];
          }
          for (i in searchSetting) {
            set = searchSetting[i];
            set.id = addon.addonid + '.' + i;
            searchSettings.push(set);
          }
        }
      }
      return searchSettings;
    },
    isAddOnEnabled: function(filter, callback) {
      var addons;
      if (filter == null) {
        filter = {};
      }
      addons = this.getEnabledAddons(callback);
      return _.findWhere(addons, filter);
    }
  };
  App.on("before:start", function() {
    new AddonApp.Router({
      controller: API
    });
    return API.getEnabledAddons(function(resp) {
      return App.vent.trigger("navMain:refresh");
    });
  });
  App.reqres.setHandler('addon:isEnabled', function(filter, callback) {
    return API.isAddOnEnabled(filter, function(enabled) {
      if (callback) {
        return callback(enabled);
      }
    });
  });
  App.reqres.setHandler('addon:enabled:addons', function(callback) {
    return API.getEnabledAddons(function(addons) {
      if (callback) {
        return callback(addons);
      }
    });
  });
  App.reqres.setHandler('addon:excludedPaths', function(addonId) {
    var excludedPaths;
    if (addonId != null) {
      excludedPaths = App.request("addon:excludedPaths:" + addonId);
    }
    if (excludedPaths == null) {
      excludedPaths = [];
    }
    return excludedPaths;
  });
  return App.reqres.setHandler('addon:search:enabled', function() {
    var settings;
    settings = config.get('app', "addOnsSearchSettings", []);
    settings = settings.concat(App.request('searchAddons:entities').toJSON());
    return settings;
  });
});

this.Kodi.module("AddonApp.GoogleMusic", function(GoogleMusic, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    addonId: 'plugin.audio.googlemusic.exp',
    searchAddon: {
      id: this.addonId,
      url: 'plugin://plugin.audio.googlemusic.exp/?path=search_result&type=track&query=[QUERY]',
      title: 'GoogleMusic',
      media: 'music'
    }
  };
  return App.reqres.setHandler("addon:search:settings:" + API.addonId, function() {
    return API.searchAddon;
  });
});

this.Kodi.module("AddonApp.List", function(List, App, Backbone, Marionette, $, _) {
  return List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      this.type = options.type;
      return App.request("addon:entities", this.type, (function(_this) {
        return function(collection) {
          collection.sortCollection('name');
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.renderList(collection);
            return _this.renderSidebar();
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.renderList = function(collection) {
      var view;
      view = new List.Addons({
        collection: collection
      });
      return this.layout.regionContent.show(view);
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.ListLayout({
        collection: collection
      });
    };

    Controller.prototype.renderSidebar = function() {
      var settingsNavView;
      settingsNavView = App.request("navMain:children:show", 'addons/all', 'Add-ons');
      return this.layout.regionSidebarFirst.show(settingsNavView);
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("AddonApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.className = "addon-list";

    return ListLayout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.Teaser = (function(superClass) {
    extend(Teaser, superClass);

    function Teaser() {
      return Teaser.__super__.constructor.apply(this, arguments);
    }

    Teaser.prototype.tagName = "li";

    return Teaser;

  })(App.Views.CardView);
  return List.Addons = (function(superClass) {
    extend(Addons, superClass);

    function Addons() {
      return Addons.__super__.constructor.apply(this, arguments);
    }

    Addons.prototype.childView = List.Teaser;

    Addons.prototype.emptyView = App.Views.EmptyViewResults;

    Addons.prototype.tagName = "ul";

    Addons.prototype.sort = 'name';

    Addons.prototype.className = "card-grid--square";

    return Addons;

  })(App.Views.CollectionView);
});

this.Kodi.module("AddonApp.MixCloud", function(MixCloud, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    addonId: 'plugin.audio.mixcloud',
    searchAddon: {
      id: this.addonId,
      url: 'plugin://plugin.audio.mixcloud/?mode=30&key=cloudcast&offset=0&query=[QUERY]',
      title: 'MixCloud',
      media: 'music'
    }
  };
  return App.reqres.setHandler("addon:search:settings:" + API.addonId, function() {
    return API.searchAddon;
  });
});

this.Kodi.module("AddonApp.Pvr", function(Pvr, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    isEnabled: function() {
      return App.request("addon:isEnabled", {
        type: 'xbmc.pvrclient'
      });
    }
  };
  return App.reqres.setHandler("addon:pvr:enabled", function() {
    return API.isEnabled();
  });
});

this.Kodi.module("AddonApp.Radio", function(Radio, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    addonId: 'plugin.audio.radio_de',
    searchAddon: {
      id: this.addonId,
      url: 'plugin://plugin.audio.radio_de/stations/search/[QUERY]',
      title: 'Radio',
      media: 'music'
    }
  };
  return App.reqres.setHandler("addon:search:settings:" + API.addonId, function() {
    return API.searchAddon;
  });
});

this.Kodi.module("AddonApp.SoundCloud", function(Soundcloud, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    addonId: 'plugin.audio.soundcloud',
    searchAddon: {
      id: this.addonId,
      url: 'plugin://plugin.audio.soundcloud/search/?query=[QUERY]',
      title: 'SoundCloud',
      media: 'music'
    }
  };
  return App.reqres.setHandler("addon:search:settings:" + API.addonId, function() {
    return API.searchAddon;
  });
});

this.Kodi.module("AddonApp.YouTube", function(Soundcloud, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    addonId: 'plugin.video.youtube',
    searchAddon: {
      url: 'plugin://plugin.video.youtube/search/?q=[QUERY]',
      title: 'YouTube',
      media: 'video'
    }
  };
  App.reqres.setHandler("addon:search:settings:" + API.addonId, function() {
    return API.searchAddon;
  });
  return App.reqres.setHandler("addon:excludedPaths:" + API.addonId, function() {
    return ['plugin://plugin.video.youtube/special/', 'plugin://plugin.video.youtube/kodion/search/', 'plugin://plugin.video.youtube/kodion/', 'plugin://plugin.video.youtube/channel/'];
  });
});

this.Kodi.module("AlbumApp", function(AlbumApp, App, Backbone, Marionette, $, _) {
  var API;
  AlbumApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "music/albums": "list",
      "music/album/:id": "view"
    };

    return Router;

  })(App.Router.Base);
  API = {
    list: function() {
      return new AlbumApp.List.Controller();
    },
    view: function(id) {
      return new AlbumApp.Show.Controller({
        id: id
      });
    },
    action: function(op, view) {
      var localPlaylist, model, playlist;
      model = view.model;
      playlist = App.request("command:kodi:controller", 'audio', 'PlayList');
      switch (op) {
        case 'play':
          return App.execute("command:audio:play", 'albumid', model.get('albumid'));
        case 'add':
          return playlist.add('albumid', model.get('albumid'));
        case 'localadd':
          return App.execute("localplaylist:addentity", 'albumid', model.get('albumid'));
        case 'localplay':
          localPlaylist = App.request("command:local:controller", 'audio', 'PlayList');
          return localPlaylist.play('albumid', model.get('albumid'));
      }
    }
  };
  App.on("before:start", function() {
    return new AlbumApp.Router({
      controller: API
    });
  });
  App.commands.setHandler('album:action', function(op, model) {
    return API.action(op, model);
  });
  App.reqres.setHandler('album:action:items', function() {
    return {
      actions: {
        thumbs: 'Thumbs up'
      },
      menu: {
        add: tr('Queue in Kodi'),
        'divider-1': '',
        localadd: tr('Add to playlist'),
        localplay: tr('Play in browser'),
        'divider-2': '',
        edit: tr('Edit')
      }
    };
  });
  return App.commands.setHandler('album:edit', function(model) {
    var loadedModel;
    loadedModel = App.request("album:entity", model.get('id'));
    return App.execute("when:entity:fetched", loadedModel, (function(_this) {
      return function() {
        return new AlbumApp.Edit.Controller({
          model: loadedModel
        });
      };
    })(this));
  });
});

this.Kodi.module("AlbumApp.Edit", function(Edit, App, Backbone, Marionette, $, _) {
  return Edit.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var form, options;
      this.model = this.getOption('model');
      options = {
        titleHtml: '<span>' + tr('Edit') + '</span>' + this.model.escape('title'),
        form: this.getStructure(),
        formState: this.model.attributes,
        config: {
          attributes: {
            "class": 'edit-form'
          },
          editForm: true,
          tabs: true,
          callback: (function(_this) {
            return function(data, formView) {
              return _this.saveCallback(data, formView);
            };
          })(this)
        }
      };
      return form = App.request("form:popup:wrapper", options);
    };

    Controller.prototype.getStructure = function() {
      return [
        {
          title: 'General',
          id: 'general',
          children: [
            {
              id: 'title',
              title: tr('Title'),
              type: 'textfield'
            }, {
              id: 'artist',
              title: tr('Artist'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'description',
              title: tr('Description'),
              type: 'textarea'
            }, {
              id: 'albumlabel',
              title: tr('Label'),
              type: 'textfield'
            }, {
              id: 'year',
              title: tr('Year'),
              type: 'number',
              format: 'integer',
              attributes: {
                "class": 'half-width',
                step: 1,
                min: 0,
                max: 9999
              }
            }, {
              id: 'rating',
              title: tr('Rating'),
              type: 'number',
              format: 'float',
              attributes: {
                "class": 'half-width',
                step: 0.1,
                min: 0,
                max: 10
              },
              suffix: '<div class="clearfix"></div>'
            }
          ]
        }, {
          title: 'Tags',
          id: 'tags',
          children: [
            {
              id: 'genre',
              title: tr('Genres'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'style',
              title: tr('Styles'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'theme',
              title: tr('Themes'),
              type: 'textarea',
              format: 'array.string'
            }, {
              id: 'mood',
              title: tr('Moods'),
              type: 'textarea',
              format: 'array.string'
            }
          ]
        }
      ];
    };

    Controller.prototype.saveCallback = function(data, formView) {
      var controller;
      controller = App.request("command:kodi:controller", 'audio', 'AudioLibrary');
      return controller.setAlbumDetails(this.model.get('id'), data, (function(_this) {
        return function() {
          Kodi.vent.trigger('entity:kodi:update', _this.model.get('uid'));
          return Kodi.execute("notification:show", t.sprintf(tr("Updated %1$s details"), 'album'));
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("AlbumApp.List", function(List, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindTriggers: function(view) {
      App.listenTo(view, 'childview:album:play', function(list, item) {
        return App.execute('album:action', 'play', item);
      });
      App.listenTo(view, 'childview:album:add', function(list, item) {
        return App.execute('album:action', 'add', item);
      });
      App.listenTo(view, 'childview:album:localadd', function(list, item) {
        return App.execute('album:action', 'localadd', item);
      });
      App.listenTo(view, 'childview:album:localplay', function(list, item) {
        return App.execute('album:action', 'localplay', item);
      });
      return App.listenTo(view, 'childview:album:edit', function(parent, item) {
        return App.execute('album:edit', item.model);
      });
    },
    getAlbumsList: function(collection) {
      var view;
      view = new List.Albums({
        collection: collection
      });
      API.bindTriggers(view);
      return view;
    }
  };
  List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var collection;
      collection = App.request("album:entities");
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          collection.availableFilters = _this.getAvailableFilters();
          collection.sectionId = 'music';
          App.request('filter:init', _this.getAvailableFilters());
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.renderList(collection);
            return _this.getFiltersView(collection);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.ListLayout({
        collection: collection
      });
    };

    Controller.prototype.getAvailableFilters = function() {
      return {
        sort: ['label', 'year', 'rating', 'artist', 'dateadded', 'random'],
        filter: ['year', 'genre', 'style', 'albumlabel', 'thumbsUp']
      };
    };

    Controller.prototype.getFiltersView = function(collection) {
      var filters;
      filters = App.request('filter:show', collection);
      this.layout.regionSidebarFirst.show(filters);
      return this.listenTo(filters, "filter:changed", (function(_this) {
        return function() {
          return _this.renderList(collection);
        };
      })(this));
    };

    Controller.prototype.renderList = function(collection) {
      var filteredCollection, view;
      App.execute("loading:show:view", this.layout.regionContent);
      filteredCollection = App.request('filter:apply:entities', collection);
      view = API.getAlbumsList(filteredCollection);
      return this.layout.regionContent.show(view);
    };

    return Controller;

  })(App.Controllers.Base);
  return App.reqres.setHandler("album:list:view", function(collection) {
    return API.getAlbumsList(collection);
  });
});

this.Kodi.module("AlbumApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.className = "album-list with-filters";

    return ListLayout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.AlbumTeaser = (function(superClass) {
    extend(AlbumTeaser, superClass);

    function AlbumTeaser() {
      return AlbumTeaser.__super__.constructor.apply(this, arguments);
    }

    AlbumTeaser.prototype.triggers = {
      "click .play": "album:play",
      "click .dropdown .add": "album:add",
      "click .dropdown .localadd": "album:localadd",
      "click .dropdown .localplay": "album:localplay",
      "click .dropdown .edit": "album:edit"
    };

    AlbumTeaser.prototype.initialize = function() {
      AlbumTeaser.__super__.initialize.apply(this, arguments);
      if (this.model != null) {
        this.setMeta();
        return this.model.set(App.request('album:action:items'));
      }
    };

    AlbumTeaser.prototype.setMeta = function() {
      if (this.model) {
        return this.model.set({
          subtitleHtml: this.themeLink(this.model.get('artist'), helpers.url.get('artist', this.model.get('artistid')))
        });
      }
    };

    return AlbumTeaser;

  })(App.Views.CardView);
  List.Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.prototype.tagName = "li";

    Empty.prototype.className = "album-empty-result";

    return Empty;

  })(App.Views.EmptyViewResults);
  return List.Albums = (function(superClass) {
    extend(Albums, superClass);

    function Albums() {
      return Albums.__super__.constructor.apply(this, arguments);
    }

    Albums.prototype.childView = List.AlbumTeaser;

    Albums.prototype.emptyView = List.Empty;

    Albums.prototype.tagName = "ul";

    Albums.prototype.sort = 'artist';

    Albums.prototype.className = "card-grid--square";

    return Albums;

  })(App.Views.VirtualListView);
});

this.Kodi.module("AlbumApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindTriggers: function(view) {
      App.listenTo(view, 'album:play', function(item) {
        return App.execute('album:action', 'play', item);
      });
      App.listenTo(view, 'album:add', function(item) {
        return App.execute('album:action', 'add', item);
      });
      App.listenTo(view, 'album:localadd', function(item) {
        return App.execute('album:action', 'localadd', item);
      });
      App.listenTo(view, 'album:localplay', function(item) {
        return App.execute('album:action', 'localplay', item);
      });
      return App.listenTo(view, 'album:edit', function(item) {
        return App.execute('album:edit', item.model);
      });
    },
    getAlbumsFromSongs: function(songs) {
      var album, albumSet, albumsCollectionView, len, n;
      albumsCollectionView = new Show.WithSongsCollection();
      albumsCollectionView.on("add:child", (function(_this) {
        return function(albumView) {
          return App.execute("when:entity:fetched", album, function() {
            var model, songSet, songView, teaser;
            model = albumView.model;
            teaser = new Show.AlbumTeaser({
              model: model
            });
            API.bindTriggers(teaser);
            albumView.regionMeta.show(teaser);
            songSet = _.findWhere(songs, {
              albumid: model.get('albumid')
            });
            songView = App.request("song:list:view", songSet.songs);
            return albumView.regionSongs.show(songView);
          });
        };
      })(this));
      for (n = 0, len = songs.length; n < len; n++) {
        albumSet = songs[n];
        album = App.request("album:entity", albumSet.albumid, {
          success: function(album) {
            return albumsCollectionView.addChild(album, Show.WithSongsLayout);
          }
        });
      }
      return albumsCollectionView;
    }
  };
  Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var album, id;
      id = parseInt(options.id);
      album = App.request("album:entity", id);
      return App.execute("when:entity:fetched", album, (function(_this) {
        return function() {
          _this.layout = _this.getLayoutView(album);
          _this.listenTo(_this.layout, "destroy", function() {
            return App.execute("images:fanart:set", 'none');
          });
          _this.listenTo(_this.layout, "show", function() {
            _this.getMusic(id);
            return _this.getDetailsLayoutView(album);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(album) {
      return new Show.PageLayout({
        model: album
      });
    };

    Controller.prototype.getDetailsLayoutView = function(album) {
      var headerLayout;
      headerLayout = new Show.HeaderLayout({
        model: album
      });
      this.listenTo(headerLayout, "show", (function(_this) {
        return function() {
          var detail, teaser;
          teaser = new Show.AlbumDetailTeaser({
            model: album
          });
          API.bindTriggers(teaser);
          detail = new Show.Details({
            model: album
          });
          _this.listenTo(detail, "show", function() {
            return API.bindTriggers(detail);
          });
          headerLayout.regionSide.show(teaser);
          return headerLayout.regionMeta.show(detail);
        };
      })(this));
      return this.layout.regionHeader.show(headerLayout);
    };

    Controller.prototype.getMusic = function(id) {
      var options, songs;
      options = {
        filter: {
          albumid: id
        }
      };
      songs = App.request("song:entities", options);
      return App.execute("when:entity:fetched", songs, (function(_this) {
        return function() {
          var albumView, songView;
          albumView = new Show.WithSongsLayout();
          songView = App.request("song:list:view", songs);
          _this.listenTo(albumView, "show", function() {
            return albumView.regionSongs.show(songView);
          });
          return _this.layout.regionContent.show(albumView);
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
  return App.reqres.setHandler("albums:withsongs:view", function(songs) {
    return API.getAlbumsFromSongs(songs);
  });
});

this.Kodi.module("AlbumApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  Show.WithSongsLayout = (function(superClass) {
    extend(WithSongsLayout, superClass);

    function WithSongsLayout() {
      return WithSongsLayout.__super__.constructor.apply(this, arguments);
    }

    WithSongsLayout.prototype.template = 'apps/album/show/album_with_songs';

    WithSongsLayout.prototype.className = 'album-wrapper';

    WithSongsLayout.prototype.regions = {
      regionMeta: '.region-album-meta',
      regionSongs: '.region-album-songs'
    };

    return WithSongsLayout;

  })(App.Views.LayoutView);
  Show.WithSongsCollection = (function(superClass) {
    extend(WithSongsCollection, superClass);

    function WithSongsCollection() {
      return WithSongsCollection.__super__.constructor.apply(this, arguments);
    }

    WithSongsCollection.prototype.childView = Show.WithSongsLayout;

    WithSongsCollection.prototype.tagName = "div";

    WithSongsCollection.prototype.sort = 'year';

    WithSongsCollection.prototype.className = "albums-wrapper";

    return WithSongsCollection;

  })(App.Views.CollectionView);
  Show.PageLayout = (function(superClass) {
    extend(PageLayout, superClass);

    function PageLayout() {
      return PageLayout.__super__.constructor.apply(this, arguments);
    }

    PageLayout.prototype.className = 'album-show detail-container';

    return PageLayout;

  })(App.Views.LayoutWithHeaderView);
  Show.HeaderLayout = (function(superClass) {
    extend(HeaderLayout, superClass);

    function HeaderLayout() {
      return HeaderLayout.__super__.constructor.apply(this, arguments);
    }

    HeaderLayout.prototype.className = 'album-details';

    return HeaderLayout;

  })(App.Views.LayoutDetailsHeaderView);
  Show.Details = (function(superClass) {
    extend(Details, superClass);

    function Details() {
      return Details.__super__.constructor.apply(this, arguments);
    }

    Details.prototype.template = 'apps/album/show/details_meta';

    Details.prototype.triggers = {
      "click .play": "album:play",
      "click .add": "album:add",
      "click .localadd": "album:localadd",
      "click .localplay": "album:localplay",
      "click .edit": "album:edit"
    };

    return Details;

  })(App.Views.DetailsItem);
  Show.AlbumTeaser = (function(superClass) {
    extend(AlbumTeaser, superClass);

    function AlbumTeaser() {
      return AlbumTeaser.__super__.constructor.apply(this, arguments);
    }

    AlbumTeaser.prototype.tagName = "div";

    AlbumTeaser.prototype.initialize = function() {
      this.setMeta();
      return this.model.set(App.request('album:action:items'));
    };

    AlbumTeaser.prototype.setMeta = function() {
      return this.model.set({
        subtitle: this.themeLink(this.model.get('year'), 'music/albums?year=' + this.model.get('year'))
      });
    };

    AlbumTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card-minimal');
    };

    return AlbumTeaser;

  })(App.AlbumApp.List.AlbumTeaser);
  return Show.AlbumDetailTeaser = (function(superClass) {
    extend(AlbumDetailTeaser, superClass);

    function AlbumDetailTeaser() {
      return AlbumDetailTeaser.__super__.constructor.apply(this, arguments);
    }

    AlbumDetailTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card-detail');
    };

    return AlbumDetailTeaser;

  })(Show.AlbumTeaser);
});

this.Kodi.module("ArtistApp", function(ArtistApp, App, Backbone, Marionette, $, _) {
  var API;
  ArtistApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "music/artists": "list",
      "music/artist/:id": "view"
    };

    return Router;

  })(App.Router.Base);
  API = {
    list: function() {
      return new ArtistApp.List.Controller();
    },
    view: function(id) {
      return new ArtistApp.Show.Controller({
        id: id
      });
    },
    action: function(op, view) {
      var localPlaylist, model, playlist;
      model = view.model;
      playlist = App.request("command:kodi:controller", 'audio', 'PlayList');
      switch (op) {
        case 'play':
          return App.execute("command:audio:play", 'artistid', model.get('artistid'));
        case 'add':
          return playlist.add('artistid', model.get('artistid'));
        case 'localadd':
          return App.execute("localplaylist:addentity", 'artistid', model.get('artistid'));
        case 'localplay':
          localPlaylist = App.request("command:local:controller", 'audio', 'PlayList');
          return localPlaylist.play('artistid', model.get('artistid'));
      }
    }
  };
  App.on("before:start", function() {
    return new ArtistApp.Router({
      controller: API
    });
  });
  App.commands.setHandler('artist:action', function(op, model) {
    return API.action(op, model);
  });
  App.reqres.setHandler('artist:action:items', function() {
    return {
      actions: {
        thumbs: tr('Thumbs up')
      },
      menu: {
        add: tr('Queue in Kodi'),
        'divider-1': '',
        localadd: tr('Add to playlist'),
        localplay: tr('Play in browser'),
        'divider-1': '',
        edit: tr('Edit')
      }
    };
  });
  return App.commands.setHandler('artist:edit', function(model) {
    var loadedModel;
    loadedModel = App.request("artist:entity", model.get('id'));
    return App.execute("when:entity:fetched", loadedModel, (function(_this) {
      return function() {
        return new ArtistApp.Edit.Controller({
          model: loadedModel
        });
      };
    })(this));
  });
});

this.Kodi.module("ArtistApp.Edit", function(Edit, App, Backbone, Marionette, $, _) {
  return Edit.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var form, options;
      this.model = this.getOption('model');
      options = {
        titleHtml: '<span>' + tr('Edit') + '</span>' + this.model.escape('artist'),
        form: this.getStructure(),
        formState: this.model.attributes,
        config: {
          attributes: {
            "class": 'edit-form'
          },
          editForm: true,
          tabs: true,
          callback: (function(_this) {
            return function(data, formView) {
              return _this.saveCallback(data, formView);
            };
          })(this)
        }
      };
      return form = App.request("form:popup:wrapper", options);
    };

    Controller.prototype.getStructure = function() {
      return [
        {
          title: 'General',
          id: 'general',
          children: [
            {
              id: 'artist',
              title: tr('Title'),
              type: 'textfield'
            }, {
              id: 'description',
              title: tr('Description'),
              type: 'textarea'
            }, {
              id: 'formed',
              title: tr('Formed'),
              type: 'textfield',
              attributes: {
                "class": 'half-width'
              }
            }, {
              id: 'disbanded',
              title: tr('Disbanded'),
              type: 'textfield',
              attributes: {
                "class": 'half-width'
              },
              suffix: '<div class="clearfix"></div>'
            }, {
              id: 'born',
              title: tr('Born'),
              type: 'textfield',
              attributes: {
                "class": 'half-width'
              }
            }, {
              id: 'died',
              title: tr('Died'),
              type: 'textfield',
              attributes: {
                "class": 'half-width'
              },
              suffix: '<div class="clearfix"></div>'
            }, {
              id: 'yearsactive',
              title: tr('Years Active'),
              type: 'textfield',
              format: 'array.string'
            }
          ]
        }, {
          title: 'Tags',
          id: 'tags',
          children: [
            {
              id: 'genre',
              title: tr('Genres'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'style',
              title: tr('Styles'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'instrument',
              title: tr('Instruments'),
              type: 'textarea',
              format: 'array.string'
            }, {
              id: 'mood',
              title: tr('Moods'),
              type: 'textarea',
              format: 'array.string'
            }
          ]
        }
      ];
    };

    Controller.prototype.saveCallback = function(data, formView) {
      var controller;
      controller = App.request("command:kodi:controller", 'audio', 'AudioLibrary');
      return controller.setArtistDetails(this.model.get('id'), data, (function(_this) {
        return function() {
          Kodi.vent.trigger('entity:kodi:update', _this.model.get('uid'));
          return Kodi.execute("notification:show", t.sprintf(tr("Updated %1$s details"), 'album'));
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("ArtistApp.List", function(List, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindTriggers: function(view) {
      App.listenTo(view, 'childview:artist:play', function(list, item) {
        return App.execute('artist:action', 'play', item);
      });
      App.listenTo(view, 'childview:artist:add', function(list, item) {
        return App.execute('artist:action', 'add', item);
      });
      App.listenTo(view, 'childview:artist:localadd', function(list, item) {
        return App.execute('artist:action', 'localadd', item);
      });
      App.listenTo(view, 'childview:artist:localplay', function(list, item) {
        return App.execute('artist:action', 'localplay', item);
      });
      return App.listenTo(view, 'childview:artist:edit', function(parent, item) {
        return App.execute('artist:edit', item.model);
      });
    },
    getArtistList: function(collection) {
      var view;
      view = new List.Artists({
        collection: collection
      });
      API.bindTriggers(view);
      return view;
    }
  };
  List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var collection;
      collection = App.request("artist:entities");
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          collection.availableFilters = _this.getAvailableFilters();
          collection.sectionId = 'music';
          App.request('filter:init', _this.getAvailableFilters());
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.renderList(collection);
            return _this.getFiltersView(collection);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.ListLayout({
        collection: collection
      });
    };

    Controller.prototype.getAvailableFilters = function() {
      return {
        sort: ['label', 'random'],
        filter: ['mood', 'genre', 'style', 'thumbsUp']
      };
    };

    Controller.prototype.getFiltersView = function(collection) {
      var filters;
      filters = App.request('filter:show', collection);
      this.layout.regionSidebarFirst.show(filters);
      return this.listenTo(filters, "filter:changed", (function(_this) {
        return function() {
          return _this.renderList(collection);
        };
      })(this));
    };

    Controller.prototype.renderList = function(collection) {
      var filteredCollection, view;
      App.execute("loading:show:view", this.layout.regionContent);
      filteredCollection = App.request('filter:apply:entities', collection);
      view = API.getArtistList(filteredCollection);
      return this.layout.regionContent.show(view);
    };

    return Controller;

  })(App.Controllers.Base);
  return App.reqres.setHandler("artist:list:view", function(collection) {
    return API.getArtistList(collection);
  });
});

this.Kodi.module("ArtistApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.className = "artist-list with-filters";

    return ListLayout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.ArtistTeaser = (function(superClass) {
    extend(ArtistTeaser, superClass);

    function ArtistTeaser() {
      return ArtistTeaser.__super__.constructor.apply(this, arguments);
    }

    ArtistTeaser.prototype.triggers = {
      "click .play": "artist:play",
      "click .dropdown .add": "artist:add",
      "click .dropdown .localadd": "artist:localadd",
      "click .dropdown .localplay": "artist:localplay",
      "click .dropdown .edit": "artist:edit"
    };

    ArtistTeaser.prototype.initialize = function() {
      ArtistTeaser.__super__.initialize.apply(this, arguments);
      if (this.model != null) {
        return this.model.set(App.request('album:action:items'));
      }
    };

    return ArtistTeaser;

  })(App.Views.CardView);
  List.Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.prototype.tagName = "li";

    Empty.prototype.className = "artist-empty-result";

    return Empty;

  })(App.Views.EmptyViewResults);
  return List.Artists = (function(superClass) {
    extend(Artists, superClass);

    function Artists() {
      return Artists.__super__.constructor.apply(this, arguments);
    }

    Artists.prototype.childView = List.ArtistTeaser;

    Artists.prototype.emptyView = List.Empty;

    Artists.prototype.tagName = "ul";

    Artists.prototype.className = "card-grid--wide";

    return Artists;

  })(App.Views.VirtualListView);
});

this.Kodi.module("ArtistApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindTriggers: function(view) {
      App.listenTo(view, 'artist:play', function(item) {
        return App.execute('artist:action', 'play', item);
      });
      App.listenTo(view, 'artist:add', function(item) {
        return App.execute('artist:action', 'add', item);
      });
      App.listenTo(view, 'artist:localadd', function(item) {
        return App.execute('artist:action', 'localadd', item);
      });
      App.listenTo(view, 'artist:localplay', function(item) {
        return App.execute('artist:action', 'localplay', item);
      });
      return App.listenTo(view, 'artist:edit', function(item) {
        return App.execute('artist:edit', item.model);
      });
    }
  };
  return Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var artist, id;
      id = parseInt(options.id);
      artist = App.request("artist:entity", id);
      return App.execute("when:entity:fetched", artist, (function(_this) {
        return function() {
          _this.layout = _this.getLayoutView(artist);
          _this.listenTo(_this.layout, "destroy", function() {
            return App.execute("images:fanart:set", 'none');
          });
          _this.listenTo(_this.layout, "show", function() {
            _this.getMusic(id);
            return _this.getDetailsLayoutView(artist);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(artist) {
      return new Show.PageLayout({
        model: artist
      });
    };

    Controller.prototype.getDetailsLayoutView = function(artist) {
      var headerLayout;
      headerLayout = new Show.HeaderLayout({
        model: artist
      });
      this.listenTo(headerLayout, "show", (function(_this) {
        return function() {
          var detail, teaser;
          teaser = new Show.ArtistTeaser({
            model: artist
          });
          API.bindTriggers(teaser);
          detail = new Show.Details({
            model: artist
          });
          _this.listenTo(detail, "show", function() {
            return API.bindTriggers(detail);
          });
          headerLayout.regionSide.show(teaser);
          return headerLayout.regionMeta.show(detail);
        };
      })(this));
      return this.layout.regionHeader.show(headerLayout);
    };

    Controller.prototype.getMusic = function(id) {
      var loading, options, songs;
      loading = App.request("loading:get:view", tr('Loading albums'));
      this.layout.regionContent.show(loading);
      options = {
        filter: {
          artistid: id
        }
      };
      songs = App.request("song:entities", options);
      return App.execute("when:entity:fetched", songs, (function(_this) {
        return function() {
          var albumsCollection, songsCollections;
          songsCollections = App.request("song:albumparse:entities", songs);
          albumsCollection = App.request("albums:withsongs:view", songsCollections);
          return _this.layout.regionContent.show(albumsCollection);
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("ArtistApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  Show.PageLayout = (function(superClass) {
    extend(PageLayout, superClass);

    function PageLayout() {
      return PageLayout.__super__.constructor.apply(this, arguments);
    }

    PageLayout.prototype.className = 'artist-show detail-container';

    return PageLayout;

  })(App.Views.LayoutWithHeaderView);
  Show.HeaderLayout = (function(superClass) {
    extend(HeaderLayout, superClass);

    function HeaderLayout() {
      return HeaderLayout.__super__.constructor.apply(this, arguments);
    }

    HeaderLayout.prototype.className = 'artist-details';

    return HeaderLayout;

  })(App.Views.LayoutDetailsHeaderView);
  Show.Details = (function(superClass) {
    extend(Details, superClass);

    function Details() {
      return Details.__super__.constructor.apply(this, arguments);
    }

    Details.prototype.template = 'apps/artist/show/details_meta';

    Details.prototype.triggers = {
      "click .play": "artist:play",
      "click .add": "artist:add",
      "click .localadd": "artist:localadd",
      "click .localplay": "artist:localplay",
      "click .edit": "artist:edit"
    };

    return Details;

  })(App.Views.DetailsItem);
  return Show.ArtistTeaser = (function(superClass) {
    extend(ArtistTeaser, superClass);

    function ArtistTeaser() {
      return ArtistTeaser.__super__.constructor.apply(this, arguments);
    }

    ArtistTeaser.prototype.tagName = "div";

    ArtistTeaser.prototype.initialize = function() {
      return this.model.set({
        actions: {
          thumbs: tr('Thumbs up')
        }
      });
    };

    ArtistTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card-detail');
    };

    return ArtistTeaser;

  })(App.ArtistApp.List.ArtistTeaser);
});

soundManager.setup({
  url: 'lib/soundmanager/swf/',
  flashVersion: 9,
  preferFlash: true,
  useHTML5Audio: true,
  useFlashBlock: false,
  flashLoadTimeout: 3000,
  debugMode: false,
  noSWFCache: true,
  debugFlash: false,
  flashPollingInterval: 1000,
  html5PollingInterval: 1000,
  onready: function() {
    return $(window).trigger('audiostream:ready');
  },
  ontimeout: function() {
    $(window).trigger('audiostream:timeout');
    soundManager.flashLoadTimeout = 0;
    soundManager.onerror = {};
    return soundManager.reboot();
  }
});

this.Kodi.module("BrowserApp", function(BrowserApp, App, Backbone, Marionette, $, _) {
  var API;
  BrowserApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "browser": "list",
      "browser/:media/:id": "view"
    };

    return Router;

  })(App.Router.Base);
  API = {
    list: function() {
      return new BrowserApp.List.Controller;
    },
    view: function(media, id) {
      return new BrowserApp.List.Controller({
        media: media,
        id: id
      });
    }
  };
  return App.on("before:start", function() {
    return new BrowserApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("BrowserApp.List", function(List, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindFileTriggers: function(view) {
      App.listenTo(view, 'childview:file:play', (function(_this) {
        return function(set, item) {
          var playlist;
          playlist = App.request("command:kodi:controller", item.model.get('player'), 'PlayList');
          return playlist.play('file', item.model.get('file'));
        };
      })(this));
      App.listenTo(view, 'childview:file:queue', (function(_this) {
        return function(set, item) {
          var playlist;
          playlist = App.request("command:kodi:controller", item.model.get('player'), 'PlayList');
          return playlist.add('file', item.model.get('file'));
        };
      })(this));
      return App.listenTo(view, 'childview:file:download', (function(_this) {
        return function(set, item) {
          return App.request("command:kodi:controller", 'auto', 'Files').downloadFile(item.model.get('file'));
        };
      })(this));
    },
    bindFolderTriggers: function(view) {
      App.listenTo(view, 'childview:folder:play', (function(_this) {
        return function(set, item) {
          return App.request("command:kodi:controller", item.model.get('player'), 'PlayList').play('directory', item.model.get('file'));
        };
      })(this));
      return App.listenTo(view, 'childview:folder:queue', (function(_this) {
        return function(set, item) {
          return App.request("command:kodi:controller", item.model.get('player'), 'PlayList').add('directory', item.model.get('file'));
        };
      })(this));
    },
    getFileListView: function(collection) {
      var fileView;
      fileView = new List.FileList({
        collection: collection
      });
      API.bindFileTriggers(fileView);
      return fileView;
    },
    getFolderListView: function(collection) {
      var folderView;
      folderView = new List.FolderList({
        collection: collection
      });
      App.listenTo(folderView, 'childview:folder:open', (function(_this) {
        return function(set, item) {
          return App.navigate(item.model.get('url'), {
            trigger: true
          });
        };
      })(this));
      API.bindFolderTriggers(folderView);
      return folderView;
    }
  };
  List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.sourceCollection = {};

    Controller.prototype.backButtonModel = {};

    Controller.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      this.layout = this.getLayout();
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          _this.getSources(options);
          return _this.getFolderLayout();
        };
      })(this));
      return App.regionContent.show(this.layout);
    };

    Controller.prototype.getLayout = function() {
      return new List.ListLayout();
    };

    Controller.prototype.getFolderLayout = function() {
      var options;
      options = {
        sortSettings: this.getSort()
      };
      this.folderLayout = new List.FolderLayout(options);
      this.listenTo(this.folderLayout, 'browser:sort', (function(_this) {
        return function(sort, $el) {
          return _this.setSort(sort, $el);
        };
      })(this));
      this.listenTo(this.folderLayout, 'browser:play', (function(_this) {
        return function(view) {
          if (_this.model) {
            return App.request("command:kodi:controller", _this.model.get('player'), 'PlayList').play('directory', _this.model.get('file'));
          }
        };
      })(this));
      this.listenTo(this.folderLayout, 'browser:queue', (function(_this) {
        return function(view) {
          if (_this.model) {
            return App.request("command:kodi:controller", _this.model.get('player'), 'PlayList').add('directory', _this.model.get('file'));
          }
        };
      })(this));
      return this.layout.regionContent.show(this.folderLayout);
    };

    Controller.prototype.setSort = function(sort, $el) {
      var sortSettings;
      sortSettings = this.getSort();
      if (sortSettings.method === sort) {
        sortSettings.order = sortSettings.order === 'ascending' ? 'descending' : 'ascending';
      }
      if ($el) {
        $el.removeClassStartsWith('order-').addClass('order-' + sortSettings.order).addClass('active');
      }
      sortSettings.method = sort;
      if (sortSettings.method) {
        config.set('app', 'browserSort', sortSettings);
      }
      if (this.model) {
        return this.getFolder(this.model);
      }
    };

    Controller.prototype.getSort = function() {
      return config.get('app', 'browserSort', {
        method: 'none',
        order: 'ascending'
      });
    };

    Controller.prototype.getSources = function(options) {
      var sources;
      sources = App.request("file:source:entities", 'video');
      return App.execute("when:entity:fetched", sources, (function(_this) {
        return function() {
          var setView, sets;
          _this.sourceCollection = sources;
          sets = App.request("file:source:media:entities", sources);
          setView = new List.SourcesSet({
            collection: sets
          });
          _this.layout.regionSidebarFirst.show(setView);
          _this.listenTo(setView, 'childview:childview:source:open', function(set, item) {
            return _this.getFolder(item.model);
          });
          return _this.loadFromUrl(options);
        };
      })(this));
    };

    Controller.prototype.loadFromUrl = function(options) {
      var model;
      if (options.media && options.id) {
        model = App.request("file:url:entity", options.media, options.id);
        return this.getFolder(model);
      }
    };

    Controller.prototype.getFolder = function(model) {
      var collection, pathCollection, sortSettings;
      this.model = model;
      App.navigate(model.get('url'));
      sortSettings = this.getSort();
      collection = App.request("file:entities", {
        file: model.get('file'),
        media: model.get('media'),
        sort: sortSettings
      });
      pathCollection = App.request("file:path:entities", model.get('file'), this.sourceCollection);
      this.getPathList(pathCollection);
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          var collections;
          collections = App.request("file:parsed:entities", collection);
          _this.getFolderList(collections.directory);
          return _this.getFileList(collections.file);
        };
      })(this));
    };

    Controller.prototype.getFolderListView = function(collection) {
      var folderView;
      folderView = new List.FolderList({
        collection: collection
      });
      this.listenTo(folderView, 'childview:folder:open', (function(_this) {
        return function(set, item) {
          return _this.getFolder(item.model);
        };
      })(this));
      API.bindFolderTriggers(folderView);
      return folderView;
    };

    Controller.prototype.getFolderList = function(collection) {
      this.folderLayout.regionFolders.show(this.getFolderListView(collection));
      return this.getBackButton();
    };

    Controller.prototype.getFileListView = function(collection) {
      return API.getFileListView(collection);
    };

    Controller.prototype.getFileList = function(collection) {
      return this.folderLayout.regionFiles.show(this.getFileListView(collection));
    };

    Controller.prototype.getPathList = function(collection) {
      var pathView;
      pathView = new List.PathList({
        collection: collection
      });
      this.folderLayout.regionPath.show(pathView);
      this.setBackModel(collection);
      return this.listenTo(pathView, 'childview:folder:open', (function(_this) {
        return function(set, item) {
          return _this.getFolder(item.model);
        };
      })(this));
    };

    Controller.prototype.setBackModel = function(pathCollection) {
      if (pathCollection.length >= 2) {
        return this.backButtonModel = pathCollection.models[pathCollection.length - 2];
      } else {
        return this.backButtonModel = {};
      }
    };

    Controller.prototype.getBackButton = function() {
      var backView;
      if (this.backButtonModel.attributes) {
        backView = new List.Back({
          model: this.backButtonModel
        });
        this.folderLayout.regionBack.show(backView);
        return this.listenTo(backView, 'folder:open', (function(_this) {
          return function(model) {
            return _this.getFolder(model.model);
          };
        })(this));
      } else {
        return this.folderLayout.regionBack.empty();
      }
    };

    Controller.prototype.getFileViewByPath = function(path, media, callback) {
      var collection;
      collection = App.request("file:entities", {
        file: path,
        media: media
      });
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          var view;
          view = _this.getFileListView(collection);
          if (callback) {
            return callback(view);
          }
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
  App.reqres.setHandler("browser:file:view", function(collection) {
    return API.getFileListView(collection);
  });
  return App.reqres.setHandler("browser:directory:view", function(collection) {
    return API.getFolderListView(collection);
  });
});

this.Kodi.module("BrowserApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.className = "browser-page";

    return ListLayout;

  })(App.Views.LayoutWithSidebarFirstView);

  /*
    Sources
   */
  List.Source = (function(superClass) {
    extend(Source, superClass);

    function Source() {
      return Source.__super__.constructor.apply(this, arguments);
    }

    Source.prototype.template = 'apps/browser/list/source';

    Source.prototype.tagName = 'li';

    Source.prototype.triggers = {
      'click .source': 'source:open'
    };

    Source.prototype.attributes = function() {
      return {
        "class": 'type-' + this.model.get('sourcetype')
      };
    };

    return Source;

  })(App.Views.ItemView);
  List.Sources = (function(superClass) {
    extend(Sources, superClass);

    function Sources() {
      return Sources.__super__.constructor.apply(this, arguments);
    }

    Sources.prototype.template = 'apps/browser/list/source_set';

    Sources.prototype.childView = List.Source;

    Sources.prototype.tagName = "div";

    Sources.prototype.childViewContainer = 'ul.sources';

    Sources.prototype.className = "source-set";

    Sources.prototype.initialize = function() {
      return this.collection = this.model.get('sources');
    };

    return Sources;

  })(App.Views.CompositeView);
  List.SourcesSet = (function(superClass) {
    extend(SourcesSet, superClass);

    function SourcesSet() {
      return SourcesSet.__super__.constructor.apply(this, arguments);
    }

    SourcesSet.prototype.childView = List.Sources;

    SourcesSet.prototype.tagName = "div";

    SourcesSet.prototype.className = "sources-sets";

    return SourcesSet;

  })(App.Views.CollectionView);

  /*
    Folder
   */
  List.FolderLayout = (function(superClass) {
    extend(FolderLayout, superClass);

    function FolderLayout() {
      return FolderLayout.__super__.constructor.apply(this, arguments);
    }

    FolderLayout.prototype.template = 'apps/browser/list/folder_layout';

    FolderLayout.prototype.className = "folder-page-wrapper";

    FolderLayout.prototype.regions = {
      regionPath: '.path',
      regionFolders: '.folders',
      regionFiles: '.files',
      regionBack: '.back'
    };

    FolderLayout.prototype.triggers = {
      'click .play': 'browser:play',
      'click .queue': 'browser:queue'
    };

    FolderLayout.prototype.events = {
      'click .sorts li': 'sortList'
    };

    FolderLayout.prototype.sortList = function(e) {
      $('.sorts li', this.$el).removeClass('active');
      return this.trigger('browser:sort', $(e.target).data('sort'), $(e.target));
    };

    FolderLayout.prototype.onRender = function() {
      $('.sorts li', this.$el).addClass('order-' + this.options.sortSettings.order);
      return $('.sorts li[data-sort=' + this.options.sortSettings.method + ']', this.$el).addClass('active');
    };

    return FolderLayout;

  })(App.Views.LayoutView);
  List.Item = (function(superClass) {
    extend(Item, superClass);

    function Item() {
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.prototype.template = 'apps/browser/list/file';

    Item.prototype.tagName = 'li';

    Item.prototype.initialize = function() {
      return this.model.set({
        labelHtml: this.formatText(this.model.get('label'))
      });
    };

    Item.prototype.onBeforeRender = function() {
      if (!this.model.get('labelHtml')) {
        return this.model.set({
          labelHtml: this.model.escape('label')
        });
      }
    };

    return Item;

  })(App.Views.ItemView);
  List.Folder = (function(superClass) {
    extend(Folder, superClass);

    function Folder() {
      return Folder.__super__.constructor.apply(this, arguments);
    }

    Folder.prototype.className = 'folder';

    Folder.prototype.triggers = {
      'click .title': 'folder:open',
      'dblclick .title': 'file:play',
      'click .play': 'folder:play',
      'click .queue': 'folder:queue'
    };

    Folder.prototype.events = {
      "click .dropdown > i": "populateModelMenu"
    };

    Folder.prototype.initialize = function() {
      var menu;
      menu = {
        queue: tr('Queue in Kodi')
      };
      return this.model.set({
        menu: menu
      });
    };

    return Folder;

  })(List.Item);
  List.EmptyFiles = (function(superClass) {
    extend(EmptyFiles, superClass);

    function EmptyFiles() {
      return EmptyFiles.__super__.constructor.apply(this, arguments);
    }

    EmptyFiles.prototype.tagName = 'li';

    EmptyFiles.prototype.initialize = function() {
      return this.model.set({
        id: 'empty',
        content: t.gettext('no media in this folder')
      });
    };

    return EmptyFiles;

  })(App.Views.EmptyViewPage);
  List.File = (function(superClass) {
    extend(File, superClass);

    function File() {
      return File.__super__.constructor.apply(this, arguments);
    }

    File.prototype.className = 'file';

    File.prototype.triggers = {
      'click .play': 'file:play',
      'dblclick .title': 'file:play',
      'click .queue': 'file:queue',
      'click .download': 'file:download'
    };

    File.prototype.events = {
      "click .dropdown > i": "populateModelMenu"
    };

    File.prototype.initialize = function() {
      var menu;
      menu = {
        queue: tr('Queue in Kodi')
      };
      if (this.model.get('filetype') === 'file' && this.model.get('file').lastIndexOf('plugin://', 0) !== 0) {
        menu.download = tr('Download');
      }
      return this.model.set({
        menu: menu
      });
    };

    return File;

  })(List.Item);
  List.FolderList = (function(superClass) {
    extend(FolderList, superClass);

    function FolderList() {
      return FolderList.__super__.constructor.apply(this, arguments);
    }

    FolderList.prototype.tagName = 'ul';

    FolderList.prototype.className = 'browser-folder-list';

    FolderList.prototype.childView = List.Folder;

    return FolderList;

  })(App.Views.CollectionView);
  List.FileList = (function(superClass) {
    extend(FileList, superClass);

    function FileList() {
      return FileList.__super__.constructor.apply(this, arguments);
    }

    FileList.prototype.tagName = 'ul';

    FileList.prototype.className = 'browser-file-list';

    FileList.prototype.childView = List.File;

    FileList.prototype.emptyView = List.EmptyFiles;

    return FileList;

  })(App.Views.CollectionView);

  /*
    Path
   */
  List.Path = (function(superClass) {
    extend(Path, superClass);

    function Path() {
      return Path.__super__.constructor.apply(this, arguments);
    }

    Path.prototype.template = 'apps/browser/list/path';

    Path.prototype.tagName = 'li';

    Path.prototype.triggers = {
      'click .title': 'folder:open'
    };

    return Path;

  })(App.Views.ItemView);
  List.PathList = (function(superClass) {
    extend(PathList, superClass);

    function PathList() {
      return PathList.__super__.constructor.apply(this, arguments);
    }

    PathList.prototype.tagName = 'ul';

    PathList.prototype.childView = List.Path;

    return PathList;

  })(App.Views.CollectionView);
  return List.Back = (function(superClass) {
    extend(Back, superClass);

    function Back() {
      return Back.__super__.constructor.apply(this, arguments);
    }

    Back.prototype.template = 'apps/browser/list/back_button';

    Back.prototype.tagName = 'div';

    Back.prototype.className = 'back-button';

    Back.prototype.triggers = {
      'click .title': 'folder:open',
      'click i': 'folder:open'
    };

    return Back;

  })(App.Views.ItemView);
});

this.Kodi.module("CastApp", function(CastApp, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getCastCollection: function(cast, origin) {
      return App.request("cast:entities", cast, origin);
    },
    getCastView: function(collection) {
      var view;
      view = new CastApp.List.CastList({
        collection: collection
      });
      App.listenTo(view, 'childview:cast:google', function(parent, child) {
        return window.open('https://www.google.com/webhp?#q=' + encodeURIComponent(child.model.get('name')));
      });
      App.listenTo(view, 'childview:cast:imdb', function(parent, child) {
        return window.open('http://www.imdb.com/find?s=nm&q=' + encodeURIComponent(child.model.get('name')));
      });
      return view;
    }
  };
  return App.reqres.setHandler('cast:list:view', function(cast, origin) {
    var collection;
    collection = API.getCastCollection(cast, origin);
    return API.getCastView(collection);
  });
});

this.Kodi.module("CastApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.CastTeaser = (function(superClass) {
    extend(CastTeaser, superClass);

    function CastTeaser() {
      return CastTeaser.__super__.constructor.apply(this, arguments);
    }

    CastTeaser.prototype.template = 'apps/cast/list/cast';

    CastTeaser.prototype.tagName = "li";

    CastTeaser.prototype.triggers = {
      "click .imdb": "cast:imdb",
      "click .google": "cast:google"
    };

    CastTeaser.prototype.onRender = function() {
      return _.defer(function() {
        var defaultThumb;
        defaultThumb = App.request("images:path:get", '');
        return $('img', this.$el).on('error', function(e) {
          return $(this).attr('src', defaultThumb);
        });
      });
    };

    return CastTeaser;

  })(App.Views.ItemView);
  return List.CastList = (function(superClass) {
    extend(CastList, superClass);

    function CastList() {
      return CastList.__super__.constructor.apply(this, arguments);
    }

    CastList.prototype.childView = List.CastTeaser;

    CastList.prototype.tagName = "ul";

    CastList.prototype.className = "cast-full";

    return CastList;

  })(App.Views.CollectionView);
});

this.Kodi.module("CategoryApp", function(CategoryApp, App, Backbone, Marionette, $, _) {
  var API;
  CategoryApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "music/genres": "musicGenres"
    };

    return Router;

  })(App.Router.Base);
  API = {
    musicGenres: function() {
      return new CategoryApp.List.Controller({
        entityKey: 'genre:entities',
        media: 'audio',
        subNavParent: 'music'
      });
    }
  };
  return App.on("before:start", function() {
    return new CategoryApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("CategoryApp.List", function(List, App, Backbone, Marionette, $, _) {
  return List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var collection;
      collection = App.request(this.getOption('entityKey'), this.getOption('media'));
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.renderList(collection);
            return _this.getSubNav();
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.Layout({
        collection: collection
      });
    };

    Controller.prototype.renderList = function(collection) {
      var view;
      view = new List.CategoryList({
        collection: collection
      });
      return this.layout.regionContent.show(view);
    };

    Controller.prototype.getSubNav = function() {
      var subNav;
      subNav = App.request("navMain:children:show", this.getOption('subNavParent'), 'Sections');
      return this.layout.regionSidebarFirst.show(subNav);
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("CategoryApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.className = "category-list";

    return Layout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.Item = (function(superClass) {
    extend(Item, superClass);

    function Item() {
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.prototype.template = 'apps/category/list/item';

    Item.prototype.tagName = "li";

    Item.prototype.className = "card category";

    return Item;

  })(App.Views.CardView);
  return List.CategoryList = (function(superClass) {
    extend(CategoryList, superClass);

    function CategoryList() {
      return CategoryList.__super__.constructor.apply(this, arguments);
    }

    CategoryList.prototype.childView = List.Item;

    CategoryList.prototype.tagName = "ul";

    CategoryList.prototype.className = "card-grid--square";

    return CategoryList;

  })(App.Views.CollectionView);
});

this.Kodi.module("CommandApp", function(CommandApp, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    currentAudioPlaylistController: function() {
      var stateObj;
      stateObj = App.request("state:current");
      return App.request("command:" + stateObj.getPlayer() + ":controller", 'audio', 'PlayList');
    },
    currentVideoPlayerController: function() {
      var method, stateObj;
      stateObj = App.request("state:current");
      method = stateObj.getPlayer() === 'local' ? 'VideoPlayer' : 'PlayList';
      return App.request("command:" + stateObj.getPlayer() + ":controller", 'video', method);
    }
  };

  /*
    Kodi.
   */
  App.reqres.setHandler("command:kodi:player", function(method, params, callback) {
    var commander;
    commander = new CommandApp.Kodi.Player('auto');
    return commander.sendCommand(method, params, callback);
  });
  App.reqres.setHandler("command:kodi:controller", function(media, controller) {
    if (media == null) {
      media = 'auto';
    }
    return new CommandApp.Kodi[controller](media);
  });

  /*
    Local.
   */
  App.reqres.setHandler("command:local:player", function(method, params, callback) {
    var commander;
    commander = new CommandApp.Local.Player('audio');
    return commander.sendCommand(method, params, callback);
  });
  App.reqres.setHandler("command:local:controller", function(media, controller) {
    if (media == null) {
      media = 'auto';
    }
    return new CommandApp.Local[controller](media);
  });

  /*
    Wrappers single command for playing in kodi and local.
   */
  App.commands.setHandler("command:audio:play", function(type, value) {
    return API.currentAudioPlaylistController().play(type, value);
  });
  App.commands.setHandler("command:audio:add", function(type, value) {
    return API.currentAudioPlaylistController().add(type, value);
  });
  App.commands.setHandler("command:video:play", function(model, type, resume, callback) {
    var value;
    if (resume == null) {
      resume = 0;
    }
    value = model.get(type);
    return API.currentVideoPlayerController().play(type, value, model, resume, function(resp) {
      var kodiVideo, stateObj;
      stateObj = App.request("state:current");
      if (stateObj.getPlayer() === 'kodi') {
        kodiVideo = App.request("command:kodi:controller", 'video', 'GUI');
        return kodiVideo.setFullScreen(true, callback);
      }
    });
  });

  /*
    Commands that are generally used by settings pages.
   */
  App.commands.setHandler("command:kodi:audio:clean", function() {
    return App.request("command:kodi:controller", 'auto', 'AudioLibrary').clean();
  });
  App.commands.setHandler("command:kodi:video:clean", function() {
    return App.request("command:kodi:controller", 'auto', 'VideoLibrary').clean();
  });
  return App.addInitializer(function() {});
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.Base = (function(superClass) {
    extend(Base, superClass);

    function Base() {
      return Base.__super__.constructor.apply(this, arguments);
    }

    Base.prototype.ajaxOptions = {};

    Base.prototype.initialize = function(options) {
      if (options == null) {
        options = {};
      }
      $.jsonrpc.defaultUrl = helpers.url.baseKodiUrl("Base");
      return this.setOptions(options);
    };

    Base.prototype.setOptions = function(options) {
      return this.ajaxOptions = options;
    };

    Base.prototype.multipleCommands = function(commands, callback, fail) {
      var obj;
      obj = $.jsonrpc(commands, this.ajaxOptions);
      obj.fail((function(_this) {
        return function(error) {
          _this.doCallback(fail, error);
          return _this.onError(commands, error);
        };
      })(this));
      obj.done((function(_this) {
        return function(response) {
          response = _this.parseResponse(commands, response);
          _this.triggerMethod("response:ready", response);
          if (callback != null) {
            return _this.doCallback(callback, response);
          }
        };
      })(this));
      return obj;
    };

    Base.prototype.singleCommand = function(command, params, callback, fail) {
      var obj;
      command = {
        method: command,
        url: helpers.url.baseKodiUrl(command)
      };
      if ((params != null) && (params.length > 0 || _.isObject(params))) {
        command.params = params;
      }
      obj = this.multipleCommands([command], callback, fail);
      return obj;
    };

    Base.prototype.parseResponse = function(commands, response) {
      var i, result, results;
      results = [];
      for (i in response) {
        result = response[i];
        if (result.result || result.result === false) {
          results.push(result.result);
        } else {
          this.onError(commands[i], result);
        }
      }
      if (commands.length === 1 && results.length === 1) {
        results = results[0];
      }
      return results;
    };

    Base.prototype.paramObj = function(key, val) {
      return helpers.global.paramObj(key, val);
    };

    Base.prototype.doCallback = function(callback, response) {
      if (callback != null) {
        return callback(response);
      }
    };

    Base.prototype.onError = function(commands, error) {
      return helpers.debug.rpcError(commands, error);
    };

    return Base;

  })(Marionette.Object);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  Api.Commander = (function(superClass) {
    extend(Commander, superClass);

    function Commander() {
      return Commander.__super__.constructor.apply(this, arguments);
    }

    Commander.prototype.playerActive = 0;

    Commander.prototype.playerName = 'music';

    Commander.prototype.playerForced = false;

    Commander.prototype.playerIds = {
      audio: 0,
      video: 1
    };

    Commander.prototype.setPlayer = function(player) {
      if (player === 'audio' || player === 'video') {
        this.playerActive = this.playerIds[player];
        this.playerName = player;
        return this.playerForced = true;
      }
    };

    Commander.prototype.getPlayer = function() {
      return this.playerActive;
    };

    Commander.prototype.getPlayerName = function() {
      return this.playerName;
    };

    Commander.prototype.playerIdToName = function(playerId) {
      playerName;
      var id, name, playerName, ref;
      ref = this.playerIds;
      for (name in ref) {
        id = ref[name];
        if (id === playerId) {
          playerName = name;
        }
      }
      return playerName;
    };

    Commander.prototype.commandNameSpace = 'JSONRPC';

    Commander.prototype.getCommand = function(command, namespace) {
      if (namespace == null) {
        namespace = this.commandNameSpace;
      }
      return namespace + '.' + command;
    };

    Commander.prototype.sendCommand = function(command, params, callback, fail) {
      return this.singleCommand(this.getCommand(command), params, ((function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this)), (function(_this) {
        return function(err) {
          return _this.doCallback(fail, err);
        };
      })(this));
    };

    return Commander;

  })(Api.Base);
  return Api.Player = (function(superClass) {
    extend(Player, superClass);

    function Player() {
      return Player.__super__.constructor.apply(this, arguments);
    }

    Player.prototype.commandNameSpace = 'Player';

    Player.prototype.playlistApi = {};

    Player.prototype.initialize = function(media) {
      if (media == null) {
        media = 'audio';
      }
      this.setPlayer(media);
      return this.playlistApi = App.request("playlist:kodi:entity:api");
    };

    Player.prototype.getParams = function(params, callback) {
      var defaultParams;
      if (params == null) {
        params = [];
      }
      if (this.playerForced) {
        defaultParams = [this.playerActive];
        return this.doCallback(callback, defaultParams.concat(params));
      } else {
        return this.getActivePlayers((function(_this) {
          return function(activeId) {
            defaultParams = [activeId];
            return _this.doCallback(callback, defaultParams.concat(params));
          };
        })(this));
      }
    };

    Player.prototype.getActivePlayers = function(callback) {
      return this.singleCommand(this.getCommand("GetActivePlayers"), {}, (function(_this) {
        return function(resp) {
          if (resp.length > 0) {
            _this.playerActive = resp[0].playerid;
            _this.playerName = _this.playerIdToName(_this.playerActive);
            _this.triggerMethod("player:ready", _this.playerActive);
            return _this.doCallback(callback, _this.playerActive);
          } else {
            return _this.doCallback(callback, _this.playerActive);
          }
        };
      })(this));
    };

    Player.prototype.sendCommand = function(command, params, callback, fail) {
      if (params == null) {
        params = [];
      }
      return this.getParams(params, (function(_this) {
        return function(playerParams) {
          return _this.singleCommand(_this.getCommand(command), playerParams, (function(resp) {
            return _this.doCallback(callback, resp);
          }), function(err) {
            return _this.doCallback(fail, err);
          });
        };
      })(this));
    };

    Player.prototype.playEntity = function(type, value, options, callback) {
      var params;
      if (options == null) {
        options = {};
      }
      params = {
        'item': this.paramObj(type, value),
        'options': options
      };
      if (type === 'position') {
        params.item.playlistid = this.getPlayer();
      }
      return this.singleCommand(this.getCommand('Open', 'Player'), params, (function(_this) {
        return function(resp) {
          if (!App.request('sockets:active')) {
            App.request('state:kodi:update');
          }
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    Player.prototype.setPartyMode = function(op, callback) {
      if (op == null) {
        op = 'toggle';
      }
      return this.sendCommand('SetPartymode', [op], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    Player.prototype.getPlaying = function(callback) {
      var obj;
      obj = {
        active: false,
        properties: false,
        item: false
      };
      return this.singleCommand(this.getCommand('GetActivePlayers'), {}, (function(_this) {
        return function(resp) {
          var commands, itemFields, playerFields;
          if (resp.length > 0) {
            obj.active = resp[0];
            commands = [];
            itemFields = helpers.entities.getFields(_this.playlistApi.fields, 'full');
            playerFields = ["playlistid", "speed", "position", "totaltime", "time", "percentage", "shuffled", "repeat", "canrepeat", "canshuffle", "canseek", "partymode"];
            commands.push({
              method: _this.getCommand('GetProperties'),
              params: [obj.active.playerid, playerFields]
            });
            commands.push({
              method: _this.getCommand('GetItem'),
              params: [obj.active.playerid, itemFields]
            });
            return _this.multipleCommands(commands, function(playing) {
              obj.properties = playing[0];
              obj.item = playing[1].item;
              return _this.doCallback(callback, obj);
            });
          } else {
            return _this.doCallback(callback, false);
          }
        };
      })(this));
    };

    return Player;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.AddOn = (function(superClass) {
    extend(AddOn, superClass);

    function AddOn() {
      this.getAllAddons = bind(this.getAllAddons, this);
      this.getEnabledAddons = bind(this.getEnabledAddons, this);
      return AddOn.__super__.constructor.apply(this, arguments);
    }

    AddOn.prototype.commandNameSpace = 'Addons';

    AddOn.prototype.addonAllFields = ["name", "version", "summary", "description", "path", "author", "thumbnail", "disclaimer", "fanart", "dependencies", "broken", "extrainfo", "rating", "enabled"];

    AddOn.prototype.getAddons = function(type, enabled, fields, callback) {
      if (type == null) {
        type = "unknown";
      }
      if (enabled == null) {
        enabled = true;
      }
      if (fields == null) {
        fields = [];
      }
      return this.singleCommand(this.getCommand('GetAddons'), [type, "unknown", enabled, fields], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp.addons);
        };
      })(this));
    };

    AddOn.prototype.getEnabledAddons = function(load, callback) {
      var fields;
      if (load == null) {
        load = true;
      }
      fields = load ? this.addonAllFields : ["name"];
      return this.getAddons("unknown", true, fields, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    AddOn.prototype.getAllAddons = function(callback) {
      return this.getAddons("unknown", "all", this.addonAllFields, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    AddOn.prototype.executeAddon = function(addonId, params, callback) {
      var opts;
      if (params == null) {
        params = {};
      }
      opts = {
        addonid: addonId
      };
      if (!_.isEmpty(params)) {
        opts.params = params;
      }
      return this.singleCommand(this.getCommand('ExecuteAddon'), opts, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp.addons);
        };
      })(this));
    };

    return AddOn;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.Application = (function(superClass) {
    extend(Application, superClass);

    function Application() {
      return Application.__super__.constructor.apply(this, arguments);
    }

    Application.prototype.commandNameSpace = 'Application';

    Application.prototype.getProperties = function(callback) {
      return this.singleCommand(this.getCommand('GetProperties'), [["volume", "muted", "version"]], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    Application.prototype.setVolume = function(volume, callback) {
      return this.singleCommand(this.getCommand('SetVolume'), [volume], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    Application.prototype.toggleMute = function(callback) {
      var stateObj;
      stateObj = App.request("state:kodi");
      return this.singleCommand(this.getCommand('SetMute'), [!stateObj.getState('muted')], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    Application.prototype.quit = function(callback) {
      return this.singleCommand(this.getCommand('Quit'), [], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    return Application;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.AudioLibrary = (function(superClass) {
    extend(AudioLibrary, superClass);

    function AudioLibrary() {
      return AudioLibrary.__super__.constructor.apply(this, arguments);
    }

    AudioLibrary.prototype.commandNameSpace = 'AudioLibrary';

    AudioLibrary.prototype.setAlbumDetails = function(id, fields, callback) {
      var params;
      if (fields == null) {
        fields = {};
      }
      params = {
        albumid: id
      };
      params = _.extend(params, fields);
      return this.singleCommand(this.getCommand('SetAlbumDetails'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    AudioLibrary.prototype.setArtistDetails = function(id, fields, callback) {
      var params;
      if (fields == null) {
        fields = {};
      }
      params = {
        artistid: id
      };
      params = _.extend(params, fields);
      return this.singleCommand(this.getCommand('SetArtistDetails'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    AudioLibrary.prototype.setSongDetails = function(id, fields, callback) {
      var params;
      if (fields == null) {
        fields = {};
      }
      params = {
        songid: id
      };
      params = _.extend(params, fields);
      return this.singleCommand(this.getCommand('SetSongDetails'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    AudioLibrary.prototype.scan = function(callback) {
      return this.singleCommand(this.getCommand('Scan'), (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    AudioLibrary.prototype.clean = function(callback) {
      return this.singleCommand(this.getCommand('Clean'), {
        showdialogs: false
      }, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    return AudioLibrary;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.Files = (function(superClass) {
    extend(Files, superClass);

    function Files() {
      return Files.__super__.constructor.apply(this, arguments);
    }

    Files.prototype.commandNameSpace = 'Files';

    Files.prototype.prepareDownload = function(file, callback) {
      return this.singleCommand(this.getCommand('PrepareDownload'), [file], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    Files.prototype.downloadPath = function(file, callback) {
      return this.prepareDownload(file, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp.details.path);
        };
      })(this));
    };

    Files.prototype.downloadFile = function(file) {
      var dl;
      dl = window.open('about:blank', 'download');
      return this.downloadPath(file, function(path) {
        return dl.location = path;
      });
    };

    Files.prototype.videoStream = function(file, background, player) {
      var st;
      if (background == null) {
        background = '';
      }
      if (player == null) {
        player = 'html5';
      }
      st = helpers.global.localVideoPopup('about:blank');
      return this.downloadPath(file, function(path) {
        return st.location = "videoPlayer.html?player=" + player + '&src=' + encodeURIComponent(path) + '&bg=' + encodeURIComponent(background);
      });
    };

    return Files;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.GUI = (function(superClass) {
    extend(GUI, superClass);

    function GUI() {
      return GUI.__super__.constructor.apply(this, arguments);
    }

    GUI.prototype.commandNameSpace = 'GUI';

    GUI.prototype.setFullScreen = function(fullscreen, callback) {
      if (fullscreen == null) {
        fullscreen = true;
      }
      return this.sendCommand("SetFullscreen", [fullscreen], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    GUI.prototype.activateWindow = function(window, params, callback) {
      if (params == null) {
        params = [];
      }
      return this.sendCommand("ActivateWindow", [window, params], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    return GUI;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.Input = (function(superClass) {
    extend(Input, superClass);

    function Input() {
      return Input.__super__.constructor.apply(this, arguments);
    }

    Input.prototype.commandNameSpace = 'Input';

    Input.prototype.sendText = function(text, callback) {
      return this.singleCommand(this.getCommand('SendText'), [text], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    Input.prototype.sendInput = function(type, params, callback) {
      if (params == null) {
        params = [];
      }
      return this.singleCommand(this.getCommand(type), params, (function(_this) {
        return function(resp) {
          _this.doCallback(callback, resp);
          if (!App.request('sockets:active')) {
            return App.request('state:kodi:update', callback);
          }
        };
      })(this));
    };

    return Input;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.PlayList = (function(superClass) {
    extend(PlayList, superClass);

    function PlayList() {
      return PlayList.__super__.constructor.apply(this, arguments);
    }

    PlayList.prototype.commandNameSpace = 'Playlist';

    PlayList.prototype.play = function(type, value, model, resume, callback) {
      if (resume == null) {
        resume = 0;
      }
      return this.getItems((function(_this) {
        return function(currentPlaylist) {
          var inPlaylist, plItem, pos, stateObj;
          plItem = {
            type: type.replace('id', ''),
            id: value
          };
          inPlaylist = currentPlaylist.items ? _.findWhere(currentPlaylist.items, plItem) : false;
          if (inPlaylist) {
            return _this.playPosition(inPlaylist.position, resume, callback);
          } else {
            stateObj = App.request("state:kodi");
            if (stateObj.isPlaying(_this.getPlayerName())) {
              pos = currentPlaylist.items ? stateObj.getPlaying('position') + 1 : 0;
              return _this.insertAndPlay(type, value, pos, resume, callback);
            } else {
              return _this.clear(function() {
                return _this.insertAndPlay(type, value, 0, resume, callback);
              });
            }
          }
        };
      })(this));
    };

    PlayList.prototype.addCollection = function(collection, position, callback) {
      var stateObj;
      if (position == null) {
        position = 0;
      }
      stateObj = App.request("state:kodi");
      if (stateObj.isPlaying(this.getPlayerName())) {
        position = stateObj.getPlaying('position') + 1;
        this.addCollectionItems(collection, position, callback);
      } else {
        this.clear((function(_this) {
          return function() {
            return _this.addCollectionItems(collection, position, callback);
          };
        })(this));
      }
      return position;
    };

    PlayList.prototype.addCollectionItems = function(collection, position, callback) {
      var commands, i, model, models, params, player, pos, type;
      if (position == null) {
        position = 0;
      }
      App.execute("notification:show", t.gettext("Adding items to the queue"));
      models = collection.getRawCollection();
      player = this.getPlayer();
      commands = [];
      for (i in models) {
        model = models[i];
        pos = parseInt(position) + parseInt(i);
        type = model.type === 'file' ? 'file' : model.type + 'id';
        params = [player, pos, this.paramObj(type, model[type])];
        commands.push({
          method: this.getCommand('Insert'),
          params: params
        });
      }
      return this.multipleCommands(commands, (function(_this) {
        return function(resp) {
          _this.doCallback(callback, resp);
          return _this.refreshPlaylistView();
        };
      })(this));
    };

    PlayList.prototype.playCollection = function(collection, position) {
      var pos;
      if (position == null) {
        position = 0;
      }
      return pos = this.addCollection(collection, position, (function(_this) {
        return function(resp) {
          _this.playEntity('position', parseInt(pos), {}, function() {});
          return _this.refreshPlaylistView();
        };
      })(this));
    };

    PlayList.prototype.add = function(type, value) {
      return this.playlistSize((function(_this) {
        return function(size) {
          return _this.insert(type, value, size);
        };
      })(this));
    };

    PlayList.prototype.remove = function(position, callback) {
      return this.singleCommand(this.getCommand('Remove'), [this.getPlayer(), parseInt(position)], (function(_this) {
        return function(resp) {
          _this.refreshPlaylistView();
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    PlayList.prototype.clear = function(callback) {
      return this.singleCommand(this.getCommand('Clear'), [this.getPlayer()], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    PlayList.prototype.insert = function(type, value, position, callback) {
      if (position == null) {
        position = 0;
      }
      return this.singleCommand(this.getCommand('Insert'), [this.getPlayer(), parseInt(position), this.paramObj(type, value)], (function(_this) {
        return function(resp) {
          _this.refreshPlaylistView();
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    PlayList.prototype.getItems = function(callback) {
      return this.singleCommand(this.getCommand('GetItems'), [this.getPlayer(), ['title']], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, _this.parseItems(resp));
        };
      })(this));
    };

    PlayList.prototype.parseItems = function(resp) {
      if (resp.items) {
        resp.items = _.map(resp.items, function(item, idx) {
          item.position = parseInt(idx);
          return item;
        });
      }
      return resp;
    };

    PlayList.prototype.insertAndPlay = function(type, value, position, resume, callback) {
      if (position == null) {
        position = 0;
      }
      if (resume == null) {
        resume = 0;
      }
      return this.insert(type, value, position, (function(_this) {
        return function(resp) {
          return _this.playPosition(position, resume, callback);
        };
      })(this));
    };

    PlayList.prototype.playPosition = function(position, resume, callback) {
      if (position == null) {
        position = 0;
      }
      if (resume == null) {
        resume = 0;
      }
      return this.playEntity('position', parseInt(position), {}, (function(_this) {
        return function() {
          if (resume > 0) {
            App.execute("player:kodi:progress:update", resume);
          }
          return _this.doCallback(callback);
        };
      })(this));
    };

    PlayList.prototype.playlistSize = function(callback) {
      return this.getItems((function(_this) {
        return function(resp) {
          var position;
          position = resp.items != null ? resp.items.length : 0;
          return _this.doCallback(callback, position);
        };
      })(this));
    };

    PlayList.prototype.refreshPlaylistView = function() {
      var wsActive;
      wsActive = App.request("sockets:active");
      if (!wsActive) {
        return App.execute("playlist:refresh", 'kodi', this.playerName);
      }
    };

    PlayList.prototype.moveItem = function(media, id, position1, position2, callback) {
      var idProp;
      idProp = media === 'file' ? 'file' : media + 'id';
      return this.singleCommand(this.getCommand('Remove'), [this.getPlayer(), parseInt(position1)], (function(_this) {
        return function(resp) {
          return _this.insert(idProp, id, position2, function() {
            return _this.doCallback(callback, position2);
          });
        };
      })(this));
    };

    return PlayList;

  })(Api.Player);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.PVR = (function(superClass) {
    extend(PVR, superClass);

    function PVR() {
      return PVR.__super__.constructor.apply(this, arguments);
    }

    PVR.prototype.commandNameSpace = 'PVR';

    PVR.prototype.setRecord = function(id, fields, callback) {
      var params;
      if (fields == null) {
        fields = {};
      }
      params = {
        channel: id,
        record: 'toggle'
      };
      params = _.extend(params, fields);
      return this.singleCommand(this.getCommand('Record'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    PVR.prototype.toggleTimer = function(id, timerRule, callback) {
      var params;
      if (timerRule == null) {
        timerRule = false;
      }
      params = {
        broadcastid: id,
        timerrule: timerRule
      };
      return this.singleCommand(this.getCommand('ToggleTimer'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    PVR.prototype.addTimer = function(id, timerRule, callback) {
      var params;
      if (timerRule == null) {
        timerRule = false;
      }
      params = {
        broadcastid: id,
        timerrule: timerRule
      };
      return this.singleCommand(this.getCommand('AddTimer'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    PVR.prototype.deleteTimer = function(id, callback) {
      var params;
      params = {
        timerid: id
      };
      return this.singleCommand(this.getCommand('DeleteTimer'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    return PVR;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.Settings = (function(superClass) {
    extend(Settings, superClass);

    function Settings() {
      return Settings.__super__.constructor.apply(this, arguments);
    }

    Settings.prototype.commandNameSpace = 'Settings';

    Settings.prototype.getSettingValue = function(value, callback) {
      return this.sendCommand("getSettingValue", [value], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp.value);
        };
      })(this));
    };

    return Settings;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.System = (function(superClass) {
    extend(System, superClass);

    function System() {
      return System.__super__.constructor.apply(this, arguments);
    }

    System.prototype.commandNameSpace = 'System';

    System.prototype.getProperties = function(callback) {
      var properties;
      properties = ["canshutdown", "cansuspend", "canhibernate", "canreboot"];
      return this.singleCommand(this.getCommand('GetProperties'), [properties], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    System.prototype.hibernate = function(callback) {
      return this.singleCommand(this.getCommand('Hibernate'), [], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    System.prototype.reboot = function(callback) {
      return this.singleCommand(this.getCommand('Reboot'), [], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    System.prototype.shutdown = function(callback) {
      return this.singleCommand(this.getCommand('Shutdown'), [], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    System.prototype.suspend = function(callback) {
      return this.singleCommand(this.getCommand('Shutdown'), [], (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    return System;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Kodi", function(Api, App, Backbone, Marionette, $, _) {
  return Api.VideoLibrary = (function(superClass) {
    extend(VideoLibrary, superClass);

    function VideoLibrary() {
      return VideoLibrary.__super__.constructor.apply(this, arguments);
    }

    VideoLibrary.prototype.commandNameSpace = 'VideoLibrary';

    VideoLibrary.prototype.setEpisodeDetails = function(id, fields, callback) {
      var params;
      if (fields == null) {
        fields = {};
      }
      params = {
        episodeid: id
      };
      params = _.extend(params, fields);
      return this.singleCommand(this.getCommand('SetEpisodeDetails'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    VideoLibrary.prototype.setMovieDetails = function(id, fields, callback) {
      var params;
      if (fields == null) {
        fields = {};
      }
      params = {
        movieid: id
      };
      params = _.extend(params, fields);
      return this.singleCommand(this.getCommand('SetMovieDetails'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    VideoLibrary.prototype.setTVShowDetails = function(id, fields, callback) {
      var params;
      if (fields == null) {
        fields = {};
      }
      params = {
        tvshowid: id
      };
      params = _.extend(params, fields);
      return this.singleCommand(this.getCommand('SetTVShowDetails'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    VideoLibrary.prototype.setMusicVideoDetails = function(id, fields, callback) {
      var params;
      if (fields == null) {
        fields = {};
      }
      params = {
        musicvideoid: id
      };
      params = _.extend(params, fields);
      return this.singleCommand(this.getCommand('SetMusicVideoDetails'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    VideoLibrary.prototype.scan = function(callback) {
      return this.singleCommand(this.getCommand('Scan'), (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    VideoLibrary.prototype.clean = function(callback) {
      return this.singleCommand(this.getCommand('Clean'), {
        showdialogs: false
      }, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    VideoLibrary.prototype.toggleWatchedCollection = function(collection, op, callback) {
      var i, model, ref;
      ref = collection.models;
      for (i in ref) {
        model = ref[i];
        this.toggleWatched(model, op);
      }
      return this.doCallback(callback, true);
    };

    VideoLibrary.prototype.toggleWatched = function(model, op, callback) {
      var fields, setPlaycount;
      if (op == null) {
        op = 'auto';
      }
      if (op === 'auto') {
        setPlaycount = model.get('playcount') > 0 ? 0 : 1;
      } else if (op === 'watched') {
        setPlaycount = 1;
      } else if (op === 'unwatched') {
        setPlaycount = 0;
      }
      fields = helpers.global.paramObj('playcount', setPlaycount);
      if (model.get('type') === 'movie') {
        this.setMovieDetails(model.get('id'), fields, (function(_this) {
          return function() {
            App.vent.trigger('entity:kodi:update', model.get('uid'));
            return _this.doCallback(callback, setPlaycount);
          };
        })(this));
      }
      if (model.get('type') === 'episode') {
        return this.setEpisodeDetails(model.get('id'), fields, (function(_this) {
          return function() {
            App.vent.trigger('entity:kodi:update', model.get('uid'));
            return _this.doCallback(callback, setPlaycount);
          };
        })(this));
      }
    };

    VideoLibrary.prototype.refreshMovie = function(id, params, callback) {
      params = _.extend({
        movieid: id,
        ignorenfo: false
      }, params);
      return this.singleCommand(this.getCommand('RefreshMovie'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    VideoLibrary.prototype.refreshTVShow = function(id, params, callback) {
      params = _.extend({
        tvshowid: id,
        ignorenfo: false
      }, params);
      return this.singleCommand(this.getCommand('RefreshTVShow'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    VideoLibrary.prototype.refreshEpisode = function(id, params, callback) {
      params = _.extend({
        episodeid: id,
        ignorenfo: false
      }, params);
      return this.singleCommand(this.getCommand('RefreshEpisode'), params, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    return VideoLibrary;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Local", function(Api, App, Backbone, Marionette, $, _) {
  return Api.Base = (function(superClass) {
    extend(Base, superClass);

    function Base() {
      return Base.__super__.constructor.apply(this, arguments);
    }

    Base.prototype.localLoad = function(model, callback) {
      var files, stateObj;
      stateObj = App.request("state:local");
      if (model == null) {
        stateObj.setPlaying('playing', false);
        this.localStateUpdate();
        return;
      }
      stateObj.setState('currentPlaybackId', 'browser-' + model.get('id'));
      files = App.request("command:kodi:controller", 'video', 'Files');
      return files.downloadPath(model.get('file'), (function(_this) {
        return function(path) {
          var sm;
          sm = soundManager;
          _this.localStop();
          stateObj.setState('localPlay', sm.createSound({
            id: stateObj.getState('currentPlaybackId'),
            url: path,
            autoplay: false,
            autoLoad: true,
            stream: true,
            volume: stateObj.getState('volume'),
            onerror: function() {
              return console.log('SM ERROR!');
            },
            onplay: function() {
              stateObj.setPlayer('local');
              stateObj.setPlaying('playing', true);
              stateObj.setPlaying('paused', false);
              stateObj.setPlaying('playState', 'playing');
              stateObj.setPlaying('position', model.get('position'));
              stateObj.setPlaying('itemChanged', true);
              stateObj.setPlaying('item', model.attributes);
              stateObj.setPlaying('totaltime', helpers.global.secToTime(model.get('duration')));
              return _this.localStateUpdate();
            },
            onstop: function() {
              stateObj.setPlaying('playing', false);
              return _this.localStateUpdate();
            },
            onpause: function() {
              stateObj.setPlaying('paused', true);
              stateObj.setPlaying('playState', 'paused');
              return _this.localStateUpdate();
            },
            onresume: function() {
              stateObj.setPlaying('paused', false);
              stateObj.setPlaying('playState', 'playing');
              return _this.localStateUpdate();
            },
            onfinish: function() {
              return _this.localFinished();
            },
            whileplaying: function() {
              var dur, percentage, pos;
              pos = parseInt(this.position) / 1000;
              dur = parseInt(model.get('duration'));
              percentage = Math.round((pos / dur) * 100);
              stateObj.setPlaying('time', helpers.global.secToTime(pos));
              stateObj.setPlaying('percentage', percentage);
              return App.execute('player:local:progress:update', percentage, helpers.global.secToTime(pos));
            }
          }));
          return _this.doCallback(callback);
        };
      })(this));
    };

    Base.prototype.localFinished = function() {
      return this.localGoTo('next');
    };

    Base.prototype.localPlay = function() {
      return this.localCommand('play');
    };

    Base.prototype.localStop = function() {
      return this.localCommand('stop');
    };

    Base.prototype.localPause = function() {
      return this.localCommand('pause');
    };

    Base.prototype.localPlayPause = function() {
      var stateObj;
      stateObj = App.request("state:local");
      if (stateObj.getPlaying('paused')) {
        return this.localCommand('play');
      } else {
        return this.localCommand('pause');
      }
    };

    Base.prototype.localSetVolume = function(volume) {
      return this.localCommand('setVolume', volume);
    };

    Base.prototype.localCommand = function(command, param) {
      var currentItem, stateObj;
      stateObj = App.request("state:local");
      currentItem = stateObj.getState('localPlay');
      if (currentItem !== false) {
        currentItem[command](param);
      }
      return this.localStateUpdate();
    };

    Base.prototype.localGoTo = function(param) {
      var collection, currentPos, model, posToPlay, stateObj;
      collection = App.request("localplayer:get:entities");
      stateObj = App.request("state:local");
      currentPos = stateObj.getPlaying('position');
      posToPlay = false;
      if (collection.length > 0) {
        if (stateObj.getState('repeat') === 'one') {
          posToPlay = currentPos;
        } else if (stateObj.getState('shuffled') === true) {
          posToPlay = helpers.global.getRandomInt(0, collection.length - 1);
        } else {
          if (param === 'next') {
            if (currentPos === collection.length - 1 && stateObj.getState('repeat') === 'all') {
              posToPlay = 0;
            } else if (currentPos < collection.length) {
              posToPlay = currentPos + 1;
            }
            this.localStateNext();
          }
          if (param === 'previous') {
            if (currentPos === 0 && stateObj.getState('repeat') === 'all') {
              posToPlay = collection.length - 1;
            } else if (currentPos > 0) {
              posToPlay = currentPos - 1;
            }
          }
        }
      }
      if (posToPlay !== false) {
        model = collection.findWhere({
          position: parseInt(posToPlay)
        });
        return this.localLoad(model, (function(_this) {
          return function() {
            _this.localPlay();
            return _this.localStateUpdate();
          };
        })(this));
      }
    };

    Base.prototype.localSeek = function(percent) {
      var localPlay, newPos, sound, stateObj;
      stateObj = App.request("state:local");
      localPlay = stateObj.getState('localPlay');
      if (localPlay !== false) {
        newPos = (percent / 100) * localPlay.duration;
        sound = soundManager.getSoundById(stateObj.getState('currentPlaybackId'));
        return sound.setPosition(newPos);
      }
    };

    Base.prototype.localRepeat = function(param) {
      var i, key, newState, state, stateObj, states;
      stateObj = App.request("state:local");
      if (param !== 'cycle') {
        return stateObj.setState('repeat', param);
      } else {
        newState = false;
        states = ['off', 'all', 'one'];
        for (i in states) {
          state = states[i];
          i = parseInt(i);
          if (newState !== false) {
            continue;
          }
          if (stateObj.getState('repeat') === state) {
            if (i !== (states.length - 1)) {
              key = i + 1;
              newState = states[key];
            } else {
              newState = 'off';
            }
          }
        }
        return stateObj.setState('repeat', newState);
      }
    };

    Base.prototype.localShuffle = function() {
      var currentShuffle, stateObj;
      stateObj = App.request("state:local");
      currentShuffle = stateObj.getState('shuffled');
      return stateObj.setState('shuffled', !currentShuffle);
    };

    Base.prototype.localStateUpdate = function() {
      return App.vent.trigger("state:local:changed");
    };

    Base.prototype.localStateNext = function() {
      return App.vent.trigger("state:local:next");
    };

    Base.prototype.paramObj = function(key, val) {
      return helpers.global.paramObj(key, val);
    };

    Base.prototype.doCallback = function(callback, response) {
      if (typeof callback === 'function') {
        return callback(response);
      }
    };

    Base.prototype.onError = function(commands, error) {
      return helpers.debug.rpcError(commands, error);
    };

    return Base;

  })(Marionette.Object);
});

this.Kodi.module("CommandApp.Local", function(Api, App, Backbone, Marionette, $, _) {
  Api.Commander = (function(superClass) {
    extend(Commander, superClass);

    function Commander() {
      return Commander.__super__.constructor.apply(this, arguments);
    }

    return Commander;

  })(Api.Base);
  return Api.Player = (function(superClass) {
    extend(Player, superClass);

    function Player() {
      return Player.__super__.constructor.apply(this, arguments);
    }

    Player.prototype.playEntity = function(type, position, callback) {
      var collection, model;
      if (type == null) {
        type = 'position';
      }
      collection = App.request("localplayer:get:entities");
      model = collection.findWhere({
        position: position
      });
      return this.localLoad(model, (function(_this) {
        return function() {
          _this.localPlay();
          return _this.doCallback(callback, position);
        };
      })(this));
    };

    Player.prototype.sendCommand = function(command, param) {
      switch (command) {
        case 'GoTo':
          this.localGoTo(param);
          break;
        case 'PlayPause':
          this.localPlayPause();
          break;
        case 'Seek':
          this.localSeek(param);
          break;
        case 'SetRepeat':
          this.localRepeat(param);
          break;
        case 'SetShuffle':
          this.localShuffle();
          break;
        case 'Stop':
          this.localStop();
          break;
      }
      return this.localStateUpdate();
    };

    Player.prototype.setPartyMode = function(op, callback) {
      if (op == null) {
        op = 'toggle';
      }
      return App.execute('playlist:local:partymode', op, (function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp);
        };
      })(this));
    };

    return Player;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Local", function(Api, App, Backbone, Marionette, $, _) {
  return Api.Application = (function(superClass) {
    extend(Application, superClass);

    function Application() {
      return Application.__super__.constructor.apply(this, arguments);
    }

    Application.prototype.getProperties = function(callback) {
      var resp, stateObj;
      stateObj = App.request("state:local");
      resp = {
        volume: stateObj.getState('volume'),
        muted: stateObj.getState('muted')
      };
      return this.doCallback(callback, resp);
    };

    Application.prototype.setVolume = function(volume, callback) {
      var stateObj;
      stateObj = App.request("state:local");
      stateObj.setState('volume', volume);
      this.localSetVolume(volume);
      return this.doCallback(callback, volume);
    };

    Application.prototype.toggleMute = function(callback) {
      var stateObj, volume;
      stateObj = App.request("state:local");
      volume = 0;
      if (stateObj.getState('muted')) {
        volume = stateObj.getState('lastVolume');
        stateObj.setState('muted', false);
      } else {
        stateObj.setState('lastVolume', stateObj.getState('volume'));
        stateObj.setState('muted', true);
        volume = 0;
      }
      this.localSetVolume(volume);
      return this.doCallback(callback, volume);
    };

    return Application;

  })(Api.Commander);
});

this.Kodi.module("CommandApp.Local", function(Api, App, Backbone, Marionette, $, _) {
  return Api.PlayList = (function(superClass) {
    extend(PlayList, superClass);

    function PlayList() {
      return PlayList.__super__.constructor.apply(this, arguments);
    }

    PlayList.prototype.play = function(type, value, resume) {
      if (resume == null) {
        resume = 0;
      }
      return this.getSongs(type, value, (function(_this) {
        return function(songs) {
          return _this.playCollection(songs);
        };
      })(this));
    };

    PlayList.prototype.add = function(type, value) {
      return this.getSongs(type, value, (function(_this) {
        return function(songs) {
          return _this.addCollection(songs);
        };
      })(this));
    };

    PlayList.prototype.playCollection = function(models) {
      models = this.itemsJson(models);
      return this.clear((function(_this) {
        return function() {
          return _this.insertAndPlay(models, 0);
        };
      })(this));
    };

    PlayList.prototype.addCollection = function(models) {
      models = this.itemsJson(models);
      return this.playlistSize((function(_this) {
        return function(size) {
          return _this.insert(models, size);
        };
      })(this));
    };

    PlayList.prototype.remove = function(position, callback) {
      return this.getItems((function(_this) {
        return function(collection) {
          var item, pos, raw, ret;
          raw = _this.itemsJson(collection);
          ret = [];
          for (pos in raw) {
            item = raw[pos];
            if (parseInt(pos) !== parseInt(position)) {
              ret.push(item);
            }
          }
          return _this.clear(function() {
            collection = _this.addItems(ret);
            return _this.doCallback(callback, collection);
          });
        };
      })(this));
    };

    PlayList.prototype.clear = function(callback) {
      var collection;
      collection = App.execute("localplayer:clear:entities");
      this.refreshPlaylistView();
      return this.doCallback(callback, collection);
    };

    PlayList.prototype.insert = function(models, position, callback) {
      if (position == null) {
        position = 0;
      }
      return this.getItems((function(_this) {
        return function(collection) {
          var item, len, len1, model, n, o, pos, raw, ref, ref1, ret;
          raw = _this.itemsJson(collection);
          if (raw.length === 0) {
            ret = _.flatten([models]);
          } else if (parseInt(position) >= raw.length) {
            ret = raw;
            ref = _.flatten([models]);
            for (n = 0, len = ref.length; n < len; n++) {
              model = ref[n];
              ret.push(model);
            }
          } else {
            ret = [];
            for (pos in raw) {
              item = raw[pos];
              if (parseInt(pos) === parseInt(position)) {
                ref1 = _.flatten([models]);
                for (o = 0, len1 = ref1.length; o < len1; o++) {
                  model = ref1[o];
                  ret.push(model);
                }
              }
              ret.push(item);
            }
          }
          return _this.clear(function() {
            collection = _this.addItems(ret);
            return _this.doCallback(callback, collection);
          });
        };
      })(this));
    };

    PlayList.prototype.addItems = function(items) {
      App.request("localplayer:item:add:entities", items);
      this.updatePlayingPosition(items);
      this.refreshPlaylistView();
      return items;
    };

    PlayList.prototype.getSongs = function(type, value, callback) {
      var songs;
      if (type === 'songid') {
        return App.request("song:byid:entities", [value], (function(_this) {
          return function(songs) {
            return _this.doCallback(callback, songs.getRawCollection());
          };
        })(this));
      } else {
        songs = App.request("song:entities", {
          filter: helpers.global.paramObj(type, value)
        });
        return App.execute("when:entity:fetched", songs, (function(_this) {
          return function() {
            return _this.doCallback(callback, songs.getRawCollection());
          };
        })(this));
      }
    };

    PlayList.prototype.getItems = function(callback) {
      var collection;
      collection = App.request("localplayer:get:entities");
      return this.doCallback(callback, collection);
    };

    PlayList.prototype.itemsJson = function(collection) {
      var items;
      items = _.isArray(collection) ? collection : collection.toJSON();
      return items;
    };

    PlayList.prototype.insertAndPlay = function(models, position, callback) {
      if (position == null) {
        position = 0;
      }
      return this.insert(models, position, (function(_this) {
        return function(resp) {
          return _this.playEntity('position', parseInt(position), {}, function() {
            return _this.doCallback(callback, position);
          });
        };
      })(this));
    };

    PlayList.prototype.playlistSize = function(callback) {
      return this.getItems((function(_this) {
        return function(resp) {
          return _this.doCallback(callback, resp.length);
        };
      })(this));
    };

    PlayList.prototype.refreshPlaylistView = function() {
      return App.execute("playlist:refresh", 'local', 'audio');
    };

    PlayList.prototype.moveItem = function(media, id, position1, position2, callback) {
      return this.getItems((function(_this) {
        return function(collection) {
          var item, raw;
          raw = collection.getRawCollection();
          item = raw[position1];
          return _this.remove(position1, function() {
            return _this.insert(item, position2, function() {
              return _this.doCallback(callback, position2);
            });
          });
        };
      })(this));
    };

    PlayList.prototype.updatePlayingPosition = function(collection) {
      var i, m, model, pos, ref, set, stateObj;
      stateObj = App.request("state:local");
      if (stateObj.isPlaying()) {
        model = stateObj.getPlaying('item');
        if (model.uid) {
          set = false;
          pos = 0;
          ref = this.itemsJson(collection);
          for (i in ref) {
            m = ref[i];
            if (set === true) {
              continue;
            }
            if (m.uid === model.uid) {
              pos = parseInt(i);
              set = true;
            }
          }
          model.position = pos;
          stateObj.setPlaying('item', model);
          return stateObj.setPlaying('position', pos);
        }
      }
    };

    return PlayList;

  })(Api.Player);
});

this.Kodi.module("CommandApp.Local", function(Api, App, Backbone, Marionette, $, _) {
  return Api.VideoPlayer = (function(superClass) {
    extend(VideoPlayer, superClass);

    function VideoPlayer() {
      return VideoPlayer.__super__.constructor.apply(this, arguments);
    }

    VideoPlayer.prototype.getKodiFilesController = function() {
      return new App.CommandApp.Kodi.Files;
    };

    VideoPlayer.prototype.play = function(type, value, model) {
      return this.videoStream(model.get('file'), model.get('fanart'));
    };

    VideoPlayer.prototype.videoStream = function(file, background, player) {
      var st;
      if (background == null) {
        background = '';
      }
      if (player == null) {
        player = 'html5';
      }
      st = helpers.global.localVideoPopup('about:blank');
      return this.getKodiFilesController().downloadPath(file, function(path) {
        return st.location = "videoPlayer.html?player=" + player + '&src=' + encodeURIComponent(path) + '&bg=' + encodeURIComponent(background);
      });
    };

    return VideoPlayer;

  })(Api.Player);
});

this.Kodi.module("EPGApp", function(EPGApp, App, Backbone, Marionette, $, _) {
  var API;
  EPGApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "pvr/tv/:channelid": "tv",
      "pvr/radio/:channelid": "radio"
    };

    return Router;

  })(App.Router.Base);
  API = {
    tv: function(channelid) {
      return new EPGApp.List.Controller({
        channelid: channelid,
        type: "tv"
      });
    },
    radio: function(channelid) {
      return new EPGApp.List.Controller({
        channelid: channelid,
        type: "radio"
      });
    },
    action: function(op, view) {
      var model, player, pvr;
      model = view.model;
      player = App.request("command:kodi:controller", 'auto', 'Player');
      pvr = App.request("command:kodi:controller", 'auto', 'PVR');
      switch (op) {
        case 'play':
          return player.playEntity('channelid', model.get('channelid'));
        case 'record':
          return pvr.setRecord(model.get('channelid'), {}, function() {
            return App.execute("notification:show", tr("Channel recording toggled"));
          });
        case 'timer':
          return pvr.toggleTimer(model.get('id'));
      }
    }
  };
  App.commands.setHandler('broadcast:action', function(op, view) {
    return API.action(op, view);
  });
  return App.on("before:start", function() {
    return new EPGApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("EPGApp.List", function(List, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindTriggers: function(view) {
      App.listenTo(view, 'childview:broadcast:play', function(parent, child) {
        return App.execute('broadcast:action', 'play', child);
      });
      App.listenTo(view, 'childview:broadcast:record', function(parent, child) {
        return App.execute('broadcast:action', 'record', child);
      });
      return App.listenTo(view, 'childview:broadcast:timer', function(parent, child) {
        return App.execute('broadcast:action', 'timer', child);
      });
    },
    bindChannelTriggers: function(view) {
      App.listenTo(view, 'broadcast:play', function(child) {
        return App.execute('broadcast:action', 'play', child);
      });
      App.listenTo(view, 'broadcast:record', function(child) {
        return App.execute('broadcast:action', 'record', child);
      });
      return App.listenTo(view, 'broadcast:timer', function(child) {
        return App.execute('broadcast:action', 'timer', child);
      });
    }
  };
  return List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var model;
      model = App.request('channel:entity', options.channelid);
      return App.execute("when:entity:fetched", model, (function(_this) {
        return function() {
          var collection;
          collection = App.request("broadcast:entities", options.channelid);
          return App.execute("when:entity:fetched", collection, function() {
            _this.layout = _this.getLayoutView(collection);
            _this.listenTo(_this.layout, "show", function() {
              _this.getSubNav(model);
              _this.getChannelActions(model);
              return _this.renderProgrammes(collection);
            });
            return App.regionContent.show(_this.layout);
          });
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.Layout({
        collection: collection
      });
    };

    Controller.prototype.renderProgrammes = function(collection) {
      var view;
      view = new List.EPGList({
        collection: collection
      });
      API.bindTriggers(view);
      return this.layout.regionContent.show(view);
    };

    Controller.prototype.getSubNav = function(model) {
      var subNav;
      subNav = App.request("navMain:children:show", 'pvr/tv', 'PVR');
      return this.layout.regionSidebarFirst.show(subNav);
    };

    Controller.prototype.getChannelActions = function(model) {
      var view;
      view = new List.ChannelActions({
        model: model
      });
      API.bindChannelTriggers(view);
      return this.layout.appendSidebarView('channel-actions', view);
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("EPGApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.className = "epg-page";

    return Layout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.ChannelActions = (function(superClass) {
    extend(ChannelActions, superClass);

    function ChannelActions() {
      return ChannelActions.__super__.constructor.apply(this, arguments);
    }

    ChannelActions.prototype.template = 'apps/epg/list/channel';

    ChannelActions.prototype.className = 'nav-sub';

    ChannelActions.prototype.triggers = {
      'click .play': 'broadcast:play'
    };

    ChannelActions.prototype.events = {
      'click .record': 'toggleRecord'
    };

    ChannelActions.prototype.toggleRecord = function() {
      console.log($('.airing'));
      $('.airing').toggleClass('has-timer');
      return this.trigger('broadcast:record', this);
    };

    return ChannelActions;

  })(App.Views.ItemView);
  List.ProgrammeList = (function(superClass) {
    extend(ProgrammeList, superClass);

    function ProgrammeList() {
      return ProgrammeList.__super__.constructor.apply(this, arguments);
    }

    ProgrammeList.prototype.template = 'apps/epg/list/programme';

    ProgrammeList.prototype.tagName = "li";

    ProgrammeList.prototype.className = "pvr-card card";

    ProgrammeList.prototype.onRender = function() {
      if (this.model.attributes.wasactive) {
        this.$el.addClass("aired");
      }
      if (this.model.attributes.isactive) {
        this.$el.addClass("airing");
      }
      if (this.model.attributes.hastimer) {
        return this.$el.addClass("has-timer");
      }
    };

    ProgrammeList.prototype.triggers = {
      'click .play': 'broadcast:play'
    };

    ProgrammeList.prototype.events = {
      'click .record': 'toggleRecord',
      'click .toggle-timer': 'toggleTimer'
    };

    ProgrammeList.prototype.toggleRecord = function() {
      this.$el.toggleClass('has-timer');
      return this.trigger('broadcast:record', this);
    };

    ProgrammeList.prototype.toggleTimer = function() {
      this.$el.toggleClass('has-timer');
      return this.trigger('broadcast:timer', this);
    };

    return ProgrammeList;

  })(App.Views.ItemView);
  return List.EPGList = (function(superClass) {
    extend(EPGList, superClass);

    function EPGList() {
      return EPGList.__super__.constructor.apply(this, arguments);
    }

    EPGList.prototype.childView = List.ProgrammeList;

    EPGList.prototype.tagName = "ul";

    EPGList.prototype.className = "programmes";

    EPGList.prototype.emptyView = App.Views.EmptyViewResults;

    EPGList.prototype.emptyViewOptions = {
      emptyKey: 'EPG data'
    };

    EPGList.prototype.onShow = function() {
      var $airing;
      $airing = this.$el.find('.airing');
      if ($airing.length) {
        return $(window).scrollTop($airing.offset().top - 150);
      }
    };

    return EPGList;

  })(App.Views.CollectionView);
});

this.Kodi.module("ExternalApp", function(ExternalApp, App, Backbone, Marionette, $, _) {});

this.Kodi.module("ExternalApp.Youtube", function(Youtube, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getSearchView: function(query, viewName, title, options, callback) {
      if (title == null) {
        title = '';
      }
      if (options == null) {
        options = {};
      }
      return App.execute("youtube:search:entities", query, options, function(collection) {
        var view;
        view = new Youtube[viewName]({
          collection: collection,
          title: title
        });
        App.listenTo(view, 'childview:youtube:play', function(parent, item) {
          if (item.model.get('addonEnabled')) {
            return API.playKodi(item.model.get('id'));
          } else {
            return API.playLocal(item.model.get('id'));
          }
        });
        App.listenTo(view, 'childview:youtube:localplay', function(parent, item) {
          return API.playLocal(item.model.get('id'));
        });
        return callback(view);
      });
    },
    playLocal: function(id) {
      var localPlayer;
      localPlayer = "videoPlayer.html?yt=" + id;
      return helpers.global.localVideoPopup(localPlayer, 530);
    },
    playKodi: function(id) {
      var playlist;
      playlist = App.request("command:kodi:controller", 'video', 'PlayList');
      return playlist.play('file', 'plugin://plugin.video.youtube/play/?video_id=' + id);
    }
  };
  App.commands.setHandler("youtube:search:view", function(query, callback) {
    return API.getSearchView(query, 'List', '', {}, callback);
  });
  App.commands.setHandler("youtube:search:popup", function(query) {
    return API.getSearchView(query, 'List', '', {}, function(view) {
      var $footer;
      $footer = $('<a>', {
        "class": 'btn btn-primary',
        href: 'https://www.youtube.com/results?search_query=' + query,
        target: '_blank'
      });
      $footer.html('More videos');
      return App.execute("ui:modal:show", _.escape(query), view.render().$el, $footer);
    });
  });
  return App.commands.setHandler("youtube:list:view", function(query, title, options, callback) {
    if (options == null) {
      options = {};
    }
    return API.getSearchView(query, 'CardList', title, options, callback);
  });
});

this.Kodi.module("ExternalApp.Youtube", function(Youtube, App, Backbone, Marionette, $, _) {
  Youtube.Item = (function(superClass) {
    extend(Item, superClass);

    function Item() {
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.prototype.template = 'apps/external/youtube/youtube';

    Item.prototype.tagName = 'li';

    Item.prototype.triggers = {
      'click .play': 'youtube:play',
      'click .localplay': 'youtube:localplay'
    };

    Item.prototype.events = {
      'click .action': 'closeModal'
    };

    Item.prototype.closeModal = function() {
      return App.execute("ui:modal:close");
    };

    return Item;

  })(App.Views.ItemView);
  Youtube.List = (function(superClass) {
    extend(List, superClass);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.childView = Youtube.Item;

    List.prototype.tagName = 'ul';

    List.prototype.className = 'youtube-list';

    return List;

  })(App.Views.CollectionView);
  Youtube.Card = (function(superClass) {
    extend(Card, superClass);

    function Card() {
      return Card.__super__.constructor.apply(this, arguments);
    }

    Card.prototype.triggers = {
      'click .play': 'youtube:play',
      'click .localplay': 'youtube:localplay'
    };

    Card.prototype.initialize = function() {
      return this.getMeta();
    };

    Card.prototype.getMeta = function() {
      if (this.model) {
        this.model.set({
          subtitleHtml: this.themeLink('YouTube', this.model.get('url'), {
            external: true
          })
        });
        if (this.model.get('addonEnabled')) {
          return this.model.set({
            menu: {
              localplay: 'Local play'
            }
          });
        }
      }
    };

    Card.prototype.onRender = function() {
      return this.makeLinksExternal();
    };

    return Card;

  })(App.Views.CardView);
  return Youtube.CardList = (function(superClass) {
    extend(CardList, superClass);

    function CardList() {
      return CardList.__super__.constructor.apply(this, arguments);
    }

    CardList.prototype.childView = Youtube.Card;

    CardList.prototype.className = "section-content card-grid--musicvideo";

    return CardList;

  })(App.Views.SetCompositeView);
});

this.Kodi.module("FilterApp", function(FilterApp, App, Backbone, Marionette, $, _) {
  var API;
  API = {

    /*
      Settings/fields
     */
    sortFields: [
      {
        alias: 'title',
        type: 'string',
        defaultSort: true,
        defaultOrder: 'asc',
        key: 'title'
      }, {
        alias: 'title',
        type: 'string',
        defaultSort: true,
        defaultOrder: 'asc',
        key: 'label'
      }, {
        alias: 'year',
        type: 'number',
        key: 'year',
        defaultOrder: 'desc'
      }, {
        alias: 'date added',
        type: 'string',
        key: 'dateadded',
        defaultOrder: 'desc'
      }, {
        alias: 'rating',
        type: 'float',
        key: 'rating',
        defaultOrder: 'desc'
      }, {
        alias: 'artist',
        type: 'string',
        key: 'artist',
        defaultOrder: 'asc'
      }, {
        alias: 'random',
        type: 'other',
        key: 'random',
        defaultOrder: 'asc'
      }, {
        alias: 'album',
        type: 'string',
        key: 'album',
        defaultOrder: 'asc'
      }
    ],
    filterFields: [
      {
        alias: 'year',
        type: 'number',
        key: 'year',
        sortOrder: 'desc',
        filterCallback: 'multiple'
      }, {
        alias: 'genre',
        type: 'array',
        key: 'genre',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'mood',
        type: 'array',
        key: 'mood',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'style',
        type: 'array',
        key: 'style',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'unwatched',
        type: "boolean",
        key: 'unwatched',
        sortOrder: 'asc',
        filterCallback: 'unwatched'
      }, {
        alias: 'in progress',
        type: "boolean",
        key: 'inprogress',
        sortOrder: 'asc',
        filterCallback: 'inprogress'
      }, {
        alias: 'writer',
        type: 'array',
        key: 'writer',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'director',
        type: 'array',
        key: 'director',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'actor',
        type: 'object',
        property: 'name',
        key: 'cast',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'set',
        type: 'string',
        property: 'set',
        key: 'set',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'rated',
        type: 'string',
        property: 'mpaa',
        key: 'mpaa',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'studio',
        type: 'array',
        property: 'studio',
        key: 'studio',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'label',
        type: 'string',
        property: 'albumlabel',
        key: 'albumlabel',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'Thumbs up',
        type: "boolean",
        key: 'thumbsUp',
        sortOrder: 'asc',
        filterCallback: 'thumbsup'
      }, {
        alias: 'album',
        type: 'string',
        key: 'album',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }, {
        alias: 'artist',
        type: 'array',
        key: 'artist',
        sortOrder: 'asc',
        filterCallback: 'multiple'
      }
    ],
    getFilterFields: function(type) {
      var available, availableFilters, field, fields, key, len, n, ret;
      key = type + 'Fields';
      fields = API[key];
      availableFilters = API.getAvailable();
      available = availableFilters[type];
      ret = [];
      for (n = 0, len = fields.length; n < len; n++) {
        field = fields[n];
        if (helpers.global.inArray(field.key, available)) {
          ret.push(field);
        }
      }
      return ret;
    },

    /*
      Storage
     */
    storeFiltersNamespace: 'filter:store:',
    getStoreNameSpace: function(type) {
      return API.storeFiltersNamespace + type;
    },
    setStoreFilters: function(filters, type) {
      var store;
      if (filters == null) {
        filters = {};
      }
      if (type == null) {
        type = 'filters';
      }
      store = {};
      store[helpers.url.path()] = filters;
      helpers.cache.set(API.getStoreNameSpace(type), store);
      return App.vent.trigger('filter:changed', filters);
    },
    getStoreFilters: function(type) {
      var filters, key, path, ret, store, val;
      if (type == null) {
        type = 'filters';
      }
      store = helpers.cache.get(API.getStoreNameSpace(type), {});
      path = helpers.url.path();
      filters = store[path] ? store[path] : {};
      ret = {};
      if (!_.isEmpty(filters)) {
        for (key in filters) {
          val = filters[key];
          if (val.length > 0) {
            ret[key] = val;
          }
        }
      }
      return ret;
    },
    updateStoreFiltersKey: function(key, values) {
      var filters;
      if (values == null) {
        values = [];
      }
      filters = API.getStoreFilters();
      filters[key] = values;
      API.setStoreFilters(filters);
      return filters;
    },
    getStoreFiltersKey: function(key) {
      var filter, filters;
      filters = API.getStoreFilters();
      filter = filters[key] ? filters[key] : [];
      return filter;
    },
    setStoreSort: function(method, order) {
      var sort;
      if (order == null) {
        order = 'asc';
      }
      sort = {
        method: method,
        order: order
      };
      return API.setStoreFilters(sort, 'sort');
    },
    getStoreSort: function() {
      var defaults, sort;
      sort = API.getStoreFilters('sort');
      if (!sort.method) {
        defaults = _.findWhere(API.getFilterFields('sort'), {
          defaultSort: true
        });
        sort = {
          method: defaults.key,
          order: defaults.defaultOrder
        };
      }
      return sort;
    },
    setAvailable: function(available) {
      return API.setStoreFilters(available, 'available');
    },
    getAvailable: function() {
      return API.getStoreFilters('available');
    },

    /*
      Parsing
     */
    toggleOrder: function(order) {
      order = order === 'asc' ? 'desc' : 'asc';
      return order;
    },
    parseSortable: function(items) {
      var i, item, params;
      params = API.getStoreSort(false, 'asc');
      for (i in items) {
        item = items[i];
        items[i].active = false;
        items[i].order = item.defaultOrder;
        if (params.method && item.key === params.method) {
          items[i].active = true;
          items[i].order = this.toggleOrder(params.order);
        } else if (item.defaultSort && params.method === false) {
          items[i].active = true;
        }
      }
      return items;
    },
    parseFilterable: function(items) {
      var active, activeItem, i, val;
      active = API.getFilterActive();
      for (i in items) {
        val = items[i];
        activeItem = _.findWhere(active, {
          key: val.key
        });
        items[i].active = activeItem !== void 0;
      }
      return items;
    },
    getFilterOptions: function(key, collection) {
      var collectionItems, data, i, item, items, len, limited, n, s, values;
      values = App.request('filter:store:key:get', key);
      s = API.getFilterSettings(key);
      items = [];
      collectionItems = collection.pluck(key);
      if (s.filterCallback === 'multiple' && s.type === 'object') {
        limited = [];
        for (n = 0, len = collectionItems.length; n < len; n++) {
          item = collectionItems[n];
          for (i in item) {
            data = item[i];
            if (i < 5) {
              limited.push(data[s.property]);
            }
          }
        }
        collectionItems = limited;
      }
      _.map(_.uniq(_.flatten(collectionItems)), function(val) {
        return items.push({
          key: key,
          value: val,
          active: helpers.global.inArray(val, values)
        });
      });
      return items;
    },

    /*
      Apply filters
     */
    applyFilters: function(collection) {
      var filteredCollection, key, ref, sort, values;
      sort = API.getStoreSort();
      collection.sortCollection(sort.method, sort.order);
      filteredCollection = new App.Entities.Filtered(collection);
      ref = API.getStoreFilters();
      for (key in ref) {
        values = ref[key];
        if (values.length > 0) {
          filteredCollection = API.applyFilter(filteredCollection, key, values);
        }
      }
      return filteredCollection;
    },
    applyFilter: function(collection, key, vals) {
      var s;
      s = API.getFilterSettings(key);
      switch (s.filterCallback) {
        case 'multiple':
          if (s.type === 'array') {
            collection.filterByMultipleArray(key, vals);
          } else if (s.type === 'object') {
            collection.filterByMultipleObject(key, s.property, vals);
          } else {
            collection.filterByMultiple(key, vals);
          }
          break;
        case 'unwatched':
          collection.filterByUnwatched();
          break;
        case 'inprogress':
          collection.filterByInProgress();
          break;
        case 'thumbsup':
          collection.filterByThumbsUp();
          break;
        default:
          collection;
      }
      return collection;
    },
    getFilterSettings: function(key, availableOnly) {
      var filters;
      if (availableOnly == null) {
        availableOnly = true;
      }
      filters = availableOnly === true ? API.getFilterFields('filter') : API.filterFields;
      return _.findWhere(filters, {
        key: key
      });
    },
    getFilterActive: function() {
      var items, key, ref, values;
      items = [];
      ref = API.getStoreFilters();
      for (key in ref) {
        values = ref[key];
        if (values.length > 0) {
          items.push({
            key: key,
            values: values
          });
        }
      }
      return items;
    }
  };

  /*
    Handlers.
   */
  App.reqres.setHandler('filter:show', function(collection) {
    var filters, view;
    API.setAvailable(collection.availableFilters);
    filters = new FilterApp.Show.Controller({
      refCollection: collection
    });
    view = filters.getFilterView();
    return view;
  });
  App.reqres.setHandler('filter:options', function(key, collection) {
    var filterSettings, options, optionsCollection;
    options = API.getFilterOptions(key, collection);
    optionsCollection = App.request('filter:filters:options:entities', options);
    filterSettings = API.getFilterSettings(key);
    optionsCollection.sortCollection('value', filterSettings.sortOrder);
    return optionsCollection;
  });
  App.reqres.setHandler('filter:active', function() {
    return App.request('filter:active:entities', API.getFilterActive());
  });
  App.reqres.setHandler('filter:apply:entities', function(collection) {
    var newCollection;
    API.setAvailable(collection.availableFilters);
    newCollection = API.applyFilters(collection);
    App.vent.trigger('filter:filtering:stop');
    return newCollection;
  });
  App.reqres.setHandler('filter:sortable:entities', function() {
    return App.request('filter:sort:entities', API.parseSortable(API.getFilterFields('sort')));
  });
  App.reqres.setHandler('filter:filterable:entities', function() {
    return App.request('filter:filters:entities', API.parseFilterable(API.getFilterFields('filter')));
  });
  App.reqres.setHandler('filter:init', function(availableFilters) {
    var filterSettings, key, len, n, order, params, ref, results1, values;
    params = helpers.url.params();
    if (!_.isEmpty(params)) {
      API.setStoreFilters({});
      if (params.sort) {
        order = params.order ? params.order : 'asc';
        API.setStoreSort(params.sort, order);
      }
      ref = availableFilters.filter;
      results1 = [];
      for (n = 0, len = ref.length; n < len; n++) {
        key = ref[n];
        if (params[key]) {
          values = API.getStoreFiltersKey(key);
          filterSettings = API.getFilterSettings(key, false);
          if (!helpers.global.inArray(params[key], values)) {
            if (filterSettings.type === 'number') {
              values.push(parseInt(params[key]));
            } else {
              values.push(decodeURIComponent(params[key]));
            }
            results1.push(API.updateStoreFiltersKey(key, values));
          } else {
            results1.push(void 0);
          }
        } else {
          results1.push(void 0);
        }
      }
      return results1;
    }
  });
  App.reqres.setHandler('filter:store:set', function(filters) {
    API.setStoreFilters(filters);
    return filters;
  });
  App.reqres.setHandler('filter:store:get', function() {
    return API.getStoreFilters();
  });
  App.reqres.setHandler('filter:store:key:get', function(key) {
    return API.getStoreFiltersKey(key);
  });
  App.reqres.setHandler('filter:store:key:update', function(key, values) {
    if (values == null) {
      values = [];
    }
    return API.updateStoreFiltersKey(key, values);
  });
  App.reqres.setHandler('filter:store:key:toggle', function(key, value) {
    var i, len, n, newValues, ret, values;
    values = API.getStoreFiltersKey(key);
    ret = [];
    if (_.indexOf(values, value) > -1) {
      newValues = [];
      for (n = 0, len = values.length; n < len; n++) {
        i = values[n];
        if (i !== value) {
          newValues.push(i);
        }
      }
      ret = newValues;
    } else {
      values.push(value);
      ret = values;
    }
    API.updateStoreFiltersKey(key, ret);
    return ret;
  });
  App.reqres.setHandler('filter:sort:store:set', function(method, order) {
    if (order == null) {
      order = 'asc';
    }
    return API.setStoreSort(method, order);
  });
  return App.reqres.setHandler('filter:sort:store:get', function() {
    return API.getStoreSort();
  });
});

this.Kodi.module("FilterApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.getFilterView = function() {
      var collection;
      collection = this.getOption('refCollection');
      this.layoutFilters = this.getLayoutView(collection);
      this.listenTo(this.layoutFilters, "show", (function(_this) {
        return function() {
          _this.getSort();
          _this.getFilters();
          _this.getActive();
          return _this.getSections();
        };
      })(this));
      this.listenTo(this.layoutFilters, 'filter:layout:close:filters', (function(_this) {
        return function() {
          return _this.stateChange('normal');
        };
      })(this));
      this.listenTo(this.layoutFilters, 'filter:layout:close:options', (function(_this) {
        return function() {
          return _this.stateChange('filters');
        };
      })(this));
      this.listenTo(this.layoutFilters, 'filter:layout:open:filters', (function(_this) {
        return function() {
          return _this.stateChange('filters');
        };
      })(this));
      this.listenTo(this.layoutFilters, 'filter:layout:open:options', (function(_this) {
        return function() {
          return _this.stateChange('options');
        };
      })(this));
      return this.layoutFilters;
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new Show.FilterLayout({
        collection: collection
      });
    };

    Controller.prototype.getSort = function() {
      var sortCollection, sortView;
      sortCollection = App.request('filter:sortable:entities');
      sortView = new Show.SortList({
        collection: sortCollection
      });
      this.layoutFilters.regionSort.show(sortView);
      return App.listenTo(sortView, "childview:filter:sortable:select", (function(_this) {
        return function(parentview, childview) {
          App.request('filter:sort:store:set', childview.model.get('key'), childview.model.get('order'));
          _this.layoutFilters.trigger('filter:changed');
          return _this.getSort();
        };
      })(this));
    };

    Controller.prototype.getFilters = function(clearOptions) {
      var filterCollection, filtersView;
      if (clearOptions == null) {
        clearOptions = true;
      }
      filterCollection = App.request('filter:filterable:entities');
      filtersView = new Show.FilterList({
        collection: filterCollection
      });
      App.listenTo(filtersView, "childview:filter:filterable:select", (function(_this) {
        return function(parentview, childview) {
          var key;
          key = childview.model.get('key');
          if (childview.model.get('type') === 'boolean') {
            App.request('filter:store:key:toggle', key, childview.model.get('alias'));
            return _this.triggerChange();
          } else {
            _this.getFilterOptions(key);
            return _this.stateChange('options');
          }
        };
      })(this));
      this.layoutFilters.regionFiltersList.show(filtersView);
      if (clearOptions) {
        return this.layoutFilters.regionFiltersOptions.empty();
      }
    };

    Controller.prototype.getActive = function() {
      var activeCollection, optionsView;
      activeCollection = App.request('filter:active');
      optionsView = new Show.ActiveList({
        collection: activeCollection
      });
      this.layoutFilters.regionFiltersActive.show(optionsView);
      App.listenTo(optionsView, "childview:filter:option:remove", (function(_this) {
        return function(parentview, childview) {
          var key;
          key = childview.model.get('key');
          App.request('filter:store:key:update', key, []);
          return _this.triggerChange();
        };
      })(this));
      App.listenTo(optionsView, "childview:filter:add", (function(_this) {
        return function(parentview, childview) {
          return _this.stateChange('filters');
        };
      })(this));
      return this.getFilterBar();
    };

    Controller.prototype.getFilterOptions = function(key) {
      var optionsCollection, optionsView;
      optionsCollection = App.request('filter:options', key, this.getOption('refCollection'));
      optionsView = new Show.OptionList({
        collection: optionsCollection
      });
      this.layoutFilters.regionFiltersOptions.show(optionsView);
      App.listenTo(optionsView, "childview:filter:option:select", (function(_this) {
        return function(parentview, childview) {
          var value;
          value = childview.model.get('value');
          childview.view.$el.find('.option').toggleClass('active');
          App.request('filter:store:key:toggle', key, value);
          return _this.triggerChange(false);
        };
      })(this));
      return App.listenTo(optionsView, 'filter:option:deselectall', (function(_this) {
        return function(parentview) {
          parentview.view.$el.find('.option').removeClass('active');
          App.request('filter:store:key:update', key, []);
          return _this.triggerChange(false);
        };
      })(this));
    };

    Controller.prototype.triggerChange = function(clearOptions) {
      if (clearOptions == null) {
        clearOptions = true;
      }
      App.vent.trigger('filter:filtering:start');
      this.getFilters(clearOptions);
      this.getActive();
      App.navigate(helpers.url.path());
      return this.layoutFilters.trigger('filter:changed');
    };

    Controller.prototype.getFilterBar = function() {
      var $list, $wrapper, bar, currentFilters, list;
      currentFilters = App.request('filter:store:get');
      list = _.flatten(_.values(currentFilters));
      $wrapper = $('.layout-container');
      $list = $('.region-content-top', $wrapper);
      if (list.length > 0) {
        bar = new Show.FilterBar({
          filters: list
        });
        $list.html(bar.render().$el);
        $wrapper.addClass('filters-active');
        return App.listenTo(bar, 'filter:remove:all', (function(_this) {
          return function() {
            App.request('filter:store:set', {});
            _this.triggerChange();
            return _this.stateChange('normal');
          };
        })(this));
      } else {
        return $wrapper.removeClass('filters-active');
      }
    };

    Controller.prototype.stateChange = function(state) {
      var $wrapper;
      if (state == null) {
        state = 'normal';
      }
      $wrapper = this.layoutFilters.$el.find('.filters-container');
      switch (state) {
        case 'filters':
          return $wrapper.removeClass('show-options').addClass('show-filters');
        case 'options':
          return $wrapper.addClass('show-options').removeClass('show-filters');
        default:
          return $wrapper.removeClass('show-options').removeClass('show-filters');
      }
    };

    Controller.prototype.getSections = function() {
      var collection, nav;
      collection = this.getOption('refCollection');
      if (collection.sectionId) {
        nav = App.request("navMain:children:show", collection.sectionId, 'Sections');
        return this.layoutFilters.regionNavSection.show(nav);
      }
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("FilterApp.Show", function(Show, App, Backbone, Marionette, $, _) {

  /*
    Base.
   */
  Show.FilterLayout = (function(superClass) {
    extend(FilterLayout, superClass);

    function FilterLayout() {
      return FilterLayout.__super__.constructor.apply(this, arguments);
    }

    FilterLayout.prototype.template = 'apps/filter/show/filters_ui';

    FilterLayout.prototype.className = "side-bar";

    FilterLayout.prototype.regions = {
      regionSort: '.sort-options',
      regionFiltersActive: '.filters-active',
      regionFiltersList: '.filters-list',
      regionFiltersOptions: '.filter-options-list',
      regionNavSection: '.nav-section'
    };

    FilterLayout.prototype.triggers = {
      'click .close-filters': 'filter:layout:close:filters',
      'click .close-options': 'filter:layout:close:options',
      'click .open-filters': 'filter:layout:open:filters'
    };

    return FilterLayout;

  })(App.Views.LayoutView);
  Show.ListItem = (function(superClass) {
    extend(ListItem, superClass);

    function ListItem() {
      return ListItem.__super__.constructor.apply(this, arguments);
    }

    ListItem.prototype.template = 'apps/filter/show/list_item';

    ListItem.prototype.tagName = 'li';

    return ListItem;

  })(App.Views.ItemView);
  Show.List = (function(superClass) {
    extend(List, superClass);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.childView = Show.ListItem;

    List.prototype.tagName = "ul";

    List.prototype.className = "selection-list";

    return List;

  })(App.Views.CollectionView);

  /*
    Extends.
   */
  Show.SortListItem = (function(superClass) {
    extend(SortListItem, superClass);

    function SortListItem() {
      return SortListItem.__super__.constructor.apply(this, arguments);
    }

    SortListItem.prototype.triggers = {
      "click .sortable": "filter:sortable:select"
    };

    SortListItem.prototype.initialize = function() {
      var classes, tag;
      classes = ['option', 'sortable'];
      if (this.model.get('active') === true) {
        classes.push('active');
      }
      classes.push('order-' + this.model.get('order'));
      tag = this.themeTag('span', {
        'class': classes.join(' ')
      }, t.gettext(this.model.get('alias')));
      return this.model.set({
        title: tag
      });
    };

    return SortListItem;

  })(Show.ListItem);
  Show.SortList = (function(superClass) {
    extend(SortList, superClass);

    function SortList() {
      return SortList.__super__.constructor.apply(this, arguments);
    }

    SortList.prototype.childView = Show.SortListItem;

    return SortList;

  })(Show.List);
  Show.FilterListItem = (function(superClass) {
    extend(FilterListItem, superClass);

    function FilterListItem() {
      return FilterListItem.__super__.constructor.apply(this, arguments);
    }

    FilterListItem.prototype.triggers = {
      "click .filterable": "filter:filterable:select"
    };

    FilterListItem.prototype.initialize = function() {
      var classes, tag;
      classes = ['option', 'option filterable'];
      if (this.model.get('active')) {
        classes.push('active');
      }
      tag = this.themeTag('span', {
        'class': classes.join(' ')
      }, t.gettext(this.model.get('alias')));
      return this.model.set({
        title: tag
      });
    };

    return FilterListItem;

  })(Show.ListItem);
  Show.FilterList = (function(superClass) {
    extend(FilterList, superClass);

    function FilterList() {
      return FilterList.__super__.constructor.apply(this, arguments);
    }

    FilterList.prototype.childView = Show.FilterListItem;

    return FilterList;

  })(Show.List);
  Show.OptionListItem = (function(superClass) {
    extend(OptionListItem, superClass);

    function OptionListItem() {
      return OptionListItem.__super__.constructor.apply(this, arguments);
    }

    OptionListItem.prototype.triggers = {
      "click .filterable-option": "filter:option:select"
    };

    OptionListItem.prototype.initialize = function() {
      var classes, tag;
      classes = ['option', 'option filterable-option'];
      if (this.model.get('active')) {
        classes.push('active');
      }
      tag = this.themeTag('span', {
        'class': classes.join(' ')
      }, this.model.get('value'));
      return this.model.set({
        title: tag
      });
    };

    return OptionListItem;

  })(Show.ListItem);
  Show.OptionList = (function(superClass) {
    extend(OptionList, superClass);

    function OptionList() {
      return OptionList.__super__.constructor.apply(this, arguments);
    }

    OptionList.prototype.template = 'apps/filter/show/filter_options';

    OptionList.prototype.activeValues = [];

    OptionList.prototype.childView = Show.OptionListItem;

    OptionList.prototype.childViewContainer = 'ul.selection-list';

    OptionList.prototype.onRender = function() {
      if (this.collection.length <= 10) {
        $('.options-search-wrapper', this.$el).addClass('hidden');
      }
      return $('.options-search', this.$el).filterList();
    };

    OptionList.prototype.triggers = {
      'click .deselect-all': 'filter:option:deselectall'
    };

    return OptionList;

  })(App.Views.CompositeView);
  Show.ActiveListItem = (function(superClass) {
    extend(ActiveListItem, superClass);

    function ActiveListItem() {
      return ActiveListItem.__super__.constructor.apply(this, arguments);
    }

    ActiveListItem.prototype.triggers = {
      "click .filterable-remove": "filter:option:remove"
    };

    ActiveListItem.prototype.initialize = function() {
      var tag, text, tooltip;
      tooltip = t.gettext('Remove') + ' ' + this.model.escape('key') + ' ' + t.gettext('filter');
      text = this.themeTag('span', {
        'class': 'text'
      }, this.model.get('values').join(', '));
      tag = this.themeTag('span', {
        'class': 'filter-btn filterable-remove',
        title: tooltip
      }, text);
      return this.model.set({
        title: tag
      });
    };

    return ActiveListItem;

  })(Show.ListItem);
  Show.ActiveNewListItem = (function(superClass) {
    extend(ActiveNewListItem, superClass);

    function ActiveNewListItem() {
      return ActiveNewListItem.__super__.constructor.apply(this, arguments);
    }

    ActiveNewListItem.prototype.triggers = {
      "click .filterable-add": "filter:add"
    };

    ActiveNewListItem.prototype.initialize = function() {
      var tag;
      tag = this.themeTag('span', {
        'class': 'filter-btn filterable-add'
      }, t.gettext('Add filter'));
      return this.model.set({
        title: tag
      });
    };

    return ActiveNewListItem;

  })(Show.ListItem);
  Show.ActiveList = (function(superClass) {
    extend(ActiveList, superClass);

    function ActiveList() {
      return ActiveList.__super__.constructor.apply(this, arguments);
    }

    ActiveList.prototype.childView = Show.ActiveListItem;

    ActiveList.prototype.emptyView = Show.ActiveNewListItem;

    ActiveList.prototype.className = "active-list";

    return ActiveList;

  })(Show.List);
  return Show.FilterBar = (function(superClass) {
    extend(FilterBar, superClass);

    function FilterBar() {
      return FilterBar.__super__.constructor.apply(this, arguments);
    }

    FilterBar.prototype.template = 'apps/filter/show/filters_bar';

    FilterBar.prototype.className = "filters-active-bar";

    FilterBar.prototype.onRender = function() {
      if (this.options.filters) {
        return $('.filters-active-all', this.$el).text(this.options.filters.join(', '));
      }
    };

    FilterBar.prototype.triggers = {
      'click .remove': 'filter:remove:all'
    };

    return FilterBar;

  })(App.Views.ItemView);
});

this.Kodi.module("HelpApp", function(HelpApp, App, Backbone, Marionette, $, _) {
  var API;
  HelpApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "help": "helpOverview",
      "help/overview": "helpOverview",
      "help/:id": "helpPage"
    };

    return Router;

  })(App.Router.Base);
  API = {
    helpOverview: function() {
      return new App.HelpApp.Overview.Controller();
    },
    helpPage: function(id) {
      return new HelpApp.Show.Controller({
        id: id
      });
    },
    getPage: function(id, lang, callback) {
      var content;
      if (lang == null) {
        lang = 'en';
      }
      content = $.get("lang/" + lang + "/" + id + ".html");
      content.fail(function(error) {
        if (lang !== 'en') {
          return API.getPage(id, 'en', callback);
        }
      });
      content.done(function(data) {
        return callback(data);
      });
      return content;
    },
    getSubNav: function() {
      var collection;
      collection = App.request("navMain:array:entities", this.getSideBarStructure());
      return App.request("navMain:collection:show", collection, t.gettext('Help topics'));
    },
    getSideBarStructure: function() {
      return [
        {
          title: t.gettext('About'),
          path: 'help'
        }, {
          title: t.gettext('Readme'),
          path: 'help/app-readme'
        }, {
          title: t.gettext('Changelog'),
          path: 'help/app-changelog'
        }, {
          title: t.gettext('Keyboard'),
          path: 'help/keybind-readme'
        }, {
          title: t.gettext('Add-ons'),
          path: 'help/addons'
        }, {
          title: t.gettext('Developers'),
          path: 'help/developers'
        }, {
          title: t.gettext('Translations'),
          path: 'help/lang-readme'
        }, {
          title: t.gettext('License'),
          path: 'help/license'
        }
      ];
    }
  };
  App.reqres.setHandler('help:subnav', function() {
    return API.getSubNav();
  });
  App.reqres.setHandler('help:page', function(id, callback) {
    var lang;
    lang = config.getLocal('lang', 'en');
    return API.getPage(id, lang, callback);
  });
  return App.on("before:start", function() {
    return new HelpApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("HelpApp.Overview", function(Overview, App, Backbone, Marionette, $, _) {
  return Overview.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      return App.request("help:page", 'help-overview', (function(_this) {
        return function(data) {
          _this.layout = _this.getLayoutView(data);
          _this.listenTo(_this.layout, "show", function() {
            _this.getSideBar();
            return _this.getPage(data);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getPage = function(data) {
      this.pageView = new Overview.Page({
        data: data
      });
      this.listenTo(this.pageView, "show", (function(_this) {
        return function() {
          return _this.getReport();
        };
      })(this));
      return this.layout.regionContent.show(this.pageView);
    };

    Controller.prototype.getSideBar = function() {
      var subNav;
      subNav = App.request("help:subnav");
      return this.layout.regionSidebarFirst.show(subNav);
    };

    Controller.prototype.getLayoutView = function() {
      return new Overview.Layout();
    };

    Controller.prototype.getReport = function() {
      this.$pageView = this.pageView.$el;
      this.getReportChorusVersion();
      this.getReportKodiVersion();
      this.getReportWebsocketsActive();
      this.getReportLocalAudio();
      App.vent.on("sockets:available", (function(_this) {
        return function() {
          return _this.getReportWebsocketsActive();
        };
      })(this));
      return App.vent.on("state:initialized", (function(_this) {
        return function() {
          return _this.getReportKodiVersion();
        };
      })(this));
    };

    Controller.prototype.getReportChorusVersion = function() {
      return $.get("addon.xml", (function(_this) {
        return function(data) {
          return $('.report-chorus-version > span', _this.$pageView).text($('addon', data).attr('version'));
        };
      })(this));
    };

    Controller.prototype.getReportKodiVersion = function() {
      var kodiVersion, state;
      state = App.request("state:kodi");
      kodiVersion = state.getState('version');
      return $('.report-kodi-version > span', this.$pageView).text(kodiVersion.major + '.' + kodiVersion.minor);
    };

    Controller.prototype.getReportWebsocketsActive = function() {
      var $ws, wsActive;
      wsActive = App.request("sockets:active");
      $ws = $('.report-websockets', this.$pageView);
      if (wsActive) {
        $('span', $ws).text(tr("Remote control is set up correctly"));
        return $ws.removeClass('warning');
      } else {
        $('span', $ws).html(tr("You need to 'Allow remote control' for Kodi. You can do that") + ' <a href="#settings/kodi/services">' + tr('here') + '</a>');
        return $ws.addClass('warning');
      }
    };

    Controller.prototype.getReportLocalAudio = function() {
      var localAudio;
      localAudio = soundManager.useHTML5Audio ? "HTML 5" : "Flash";
      return $('.report-local-audio > span', this.$pageView).text(localAudio);
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("HelpApp.Overview", function(Overview, App, Backbone, Marionette, $, _) {
  Overview.Page = (function(superClass) {
    extend(Page, superClass);

    function Page() {
      return Page.__super__.constructor.apply(this, arguments);
    }

    Page.prototype.className = "help--overview";

    Page.prototype.template = 'apps/help/overview/overview';

    Page.prototype.tagName = "div";

    Page.prototype.onRender = function() {
      return $('.help--overview--header', this.$el).html(this.options.data);
    };

    return Page;

  })(App.Views.CompositeView);
  return Overview.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.className = "help--page help--overview page-wrapper";

    return Layout;

  })(App.Views.LayoutWithSidebarFirstView);
});

this.Kodi.module("HelpApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      return App.request("help:page", options.id, (function(_this) {
        return function(data) {
          _this.layout = _this.getLayoutView(data);
          _this.listenTo(_this.layout, "show", function() {
            return _this.getSideBar();
          });
          App.regionContent.show(_this.layout);
          if (options.pageView) {
            return _this.layout.regionContent.show(options.pageView);
          }
        };
      })(this));
    };

    Controller.prototype.getSideBar = function() {
      var subNav;
      subNav = App.request("help:subnav");
      return this.layout.regionSidebarFirst.show(subNav);
    };

    Controller.prototype.getLayoutView = function(data) {
      return new Show.Layout({
        data: data,
        pageView: this.options.pageView
      });
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("HelpApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.className = "help--page page-wrapper";

    Layout.prototype.onRender = function() {
      return $(this.regionContent.el, this.$el).html(this.options.data);
    };

    return Layout;

  })(App.Views.LayoutWithSidebarFirstView);
});

this.Kodi.module("Images", function(Images, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    imagesPath: 'images/',
    defaultFanartPath: 'fanart_default/',
    defaultFanartFiles: ['cans.jpg', 'guitar.jpg', 'speaker.jpg', 'turntable.jpg', 'amp.jpg', 'concert.jpg', 'tweeter.jpg'],
    getDefaultThumbnail: function() {
      return API.imagesPath + 'thumbnail_default.png';
    },
    getRandomFanart: function() {
      var file, path, rand;
      rand = helpers.global.getRandomInt(0, API.defaultFanartFiles.length - 1);
      file = API.defaultFanartFiles[rand];
      path = API.imagesPath + API.defaultFanartPath + file;
      return path;
    },
    parseRawPath: function(rawPath) {
      var path;
      path = config.getLocal('reverseProxy') ? 'image/' + encodeURIComponent(rawPath) : '/image/' + encodeURIComponent(rawPath);
      return path;
    },
    setFanartBackground: function(path, region) {
      var $body;
      $body = App.getRegion(region).$el;
      if (path !== 'none') {
        if (!path) {
          path = this.getRandomFanart();
        }
        return $body.css('background-image', 'url(' + path + ')');
      } else {
        return $body.removeAttr('style');
      }
    },
    getImageUrl: function(rawPath, type, useFallback) {
      var path;
      if (type == null) {
        type = 'thumbnail';
      }
      if (useFallback == null) {
        useFallback = true;
      }
      path = '';
      if ((rawPath == null) || rawPath === '') {
        switch (type) {
          case 'fanart':
            path = API.getRandomFanart();
            break;
          default:
            path = API.getDefaultThumbnail();
        }
      } else if (type === 'trailer') {
        path = API.getTrailerUrl(rawPath);
      } else {
        path = API.parseRawPath(rawPath);
      }
      return path;
    },
    getTrailerUrl: function(rawpath) {
      var trailer;
      trailer = helpers.url.parseTrailerUrl(rawpath);
      return trailer.img;
    }
  };
  App.commands.setHandler("images:fanart:set", function(path, region) {
    if (region == null) {
      region = 'regionFanart';
    }
    return API.setFanartBackground(path, region);
  });
  App.reqres.setHandler("images:path:get", function(rawPath, type) {
    if (rawPath == null) {
      rawPath = '';
    }
    if (type == null) {
      type = 'thumbnail';
    }
    return API.getImageUrl(rawPath, type);
  });
  return App.reqres.setHandler("images:path:entity", function(model) {
    var i, person, ref;
    if (model.thumbnail != null) {
      model.thumbnailOriginal = model.thumbnail;
      model.thumbnail = API.getImageUrl(model.thumbnail, 'thumbnail');
    }
    if (model.fanart != null) {
      model.fanartOriginal = model.fanart;
      model.fanart = API.getImageUrl(model.fanart, 'fanart');
    }
    if ((model.cast != null) && model.cast.length > 0) {
      ref = model.cast;
      for (i in ref) {
        person = ref[i];
        model.cast[i].thumbnail = API.getImageUrl(person.thumbnail, 'thumbnail');
      }
    }
    return model;
  });
});

this.Kodi.module("InputApp", function(InputApp, App, Backbone, Marionette, $, _) {
  var API;
  InputApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "remote": "remotePage"
    };

    return Router;

  })(App.Router.Base);
  API = {
    initKeyBind: function() {
      return $(document).keydown((function(_this) {
        return function(e) {
          return _this.keyBind(e);
        };
      })(this));
    },
    inputController: function() {
      return App.request("command:kodi:controller", 'auto', 'Input');
    },
    doInput: function(type) {
      return this.inputController().sendInput(type, []);
    },
    doAction: function(action) {
      return this.inputController().sendInput('ExecuteAction', [action]);
    },
    doCommand: function(command, params, callback) {
      return App.request('command:kodi:player', command, params, (function(_this) {
        return function() {
          return _this.pollingUpdate(callback);
        };
      })(this));
    },
    appController: function() {
      return App.request("command:kodi:controller", 'auto', 'Application');
    },
    pollingUpdate: function(callback) {
      if (!App.request('sockets:active')) {
        return App.request('state:kodi:update', callback);
      }
    },
    toggleRemote: function(open) {
      var $body, rClass;
      if (open == null) {
        open = 'auto';
      }
      $body = $('body');
      rClass = 'section-remote';
      if (open === 'auto') {
        open = $body.hasClass(rClass);
      }
      if (open) {
        window.history.back();
        return helpers.backscroll.scrollToLast();
      } else {
        helpers.backscroll.setLast();
        return App.navigate("remote", {
          trigger: true
        });
      }
    },
    remotePage: function() {
      this.toggleRemote('auto');
      return App.regionContent.empty();
    },
    keyBind: function(e) {
      var kodiControl, remotePage, stateObj, vol, whiteListCommands;
      kodiControl = config.getLocal('keyboardControl') === 'kodi';
      remotePage = $('body').hasClass('page-remote');
      if ($(e.target).is("input, textarea, select")) {
        return;
      }
      whiteListCommands = [17, 16, 91, 18, 70];
      if (helpers.global.inArray(e.which, whiteListCommands)) {
        return;
      }
      if (!kodiControl && !remotePage) {
        return;
      }
      if (kodiControl || remotePage) {
        e.preventDefault();
      }
      stateObj = App.request("state:kodi");
      switch (e.which) {
        case 37:
        case 72:
          return this.doInput("Left");
        case 38:
        case 75:
          return this.doInput("Up");
        case 39:
        case 76:
          return this.doInput("Right");
        case 40:
        case 74:
          return this.doInput("Down");
        case 8:
          return this.doInput("Back");
        case 13:
          return this.doInput("Select");
        case 67:
          return this.doInput("ContextMenu");
        case 107:
        case 187:
        case 61:
          vol = stateObj.getState('volume') + 5;
          return this.appController().setVolume((vol > 100 ? 100 : Math.ceil(vol)));
        case 109:
        case 189:
        case 173:
          vol = stateObj.getState('volume') - 5;
          return this.appController().setVolume((vol < 0 ? 0 : Math.ceil(vol)));
        case 32:
          return this.doCommand("PlayPause", "toggle");
        case 88:
          return this.doCommand("Stop");
        case 84:
          return this.doAction("showsubtitles");
        case 9:
          return this.doAction("close");
        case 190:
          return this.doCommand("GoTo", "next");
        case 188:
          return this.doCommand("GoTo", "previous");
        case 220:
          return this.doAction("fullscreen");
      }
    }
  };
  App.commands.setHandler("input:textbox", function(msg) {
    return App.execute("ui:textinput:show", "Input required", {
      msg: msg
    }, function(text) {
      API.inputController().sendText(text);
      return App.execute("notification:show", t.gettext('Sent text') + ' "' + text + '" ' + t.gettext('to Kodi'));
    });
  });
  App.commands.setHandler("input:textbox:close", function() {
    return App.execute("ui:modal:close");
  });
  App.commands.setHandler("input:send", function(action) {
    return API.doInput(action);
  });
  App.commands.setHandler("input:remote:toggle", function() {
    return API.toggleRemote();
  });
  App.commands.setHandler("input:action", function(action) {
    return API.doAction(action);
  });
  App.commands.setHandler("input:resume", function(model, idKey) {
    var controller;
    controller = new InputApp.Resume.Controller();
    return controller.resumePlay(model, idKey);
  });
  App.addInitializer(function() {
    var controller;
    controller = new InputApp.Remote.Controller();
    return API.initKeyBind();
  });
  return App.on("before:start", function() {
    return new InputApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("InputApp.Remote", function(Remote, App, Backbone, Marionette, $, _) {
  return Remote.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      return App.vent.on("shell:ready", (function(_this) {
        return function(options) {
          return _this.getRemote();
        };
      })(this));
    };

    Controller.prototype.getRemote = function() {
      var view;
      view = new Remote.Control();
      this.listenTo(view, "remote:input", function(type) {
        return App.execute("input:send", type);
      });
      this.listenTo(view, "remote:player", function(type) {
        return App.request('command:kodi:player', type, []);
      });
      this.listenTo(view, "remote:info", function() {
        if (App.request("state:kodi").isPlaying()) {
          return App.execute('input:action', 'osd');
        } else {
          return App.execute("input:send", 'Info');
        }
      });
      this.listenTo(view, "remote:power", (function(_this) {
        return function() {
          return _this.getShutdownMenu();
        };
      })(this));
      App.regionRemote.show(view);
      return App.vent.on("state:changed", function(state) {
        var fanart, playingItem, stateObj;
        stateObj = App.request("state:current");
        if (stateObj.isPlayingItemChanged()) {
          playingItem = stateObj.getPlaying('item');
          fanart = App.request("images:path:get", playingItem.fanart, 'fanart');
          return $('#remote-background').css('background-image', 'url(' + playingItem.fanart + ')');
        }
      });
    };

    Controller.prototype.getShutdownMenu = function() {
      var system;
      system = App.request("command:kodi:controller", 'auto', 'System');
      return system.getProperties(function(props) {
        var $content, action, actions, len, model, n, optionalActions, prop, view;
        actions = [];
        optionalActions = ['shutdown', 'reboot', 'suspend', 'hibernate'];
        actions.push({
          id: 'quit',
          title: 'Quit Kodi'
        });
        for (n = 0, len = optionalActions.length; n < len; n++) {
          action = optionalActions[n];
          prop = 'can' + action;
          if (props[prop]) {
            actions.push({
              id: action,
              title: action
            });
          }
        }
        model = new Backbone.Model({
          id: 1,
          actions: actions
        });
        view = new Remote.System({
          model: model
        });
        $content = view.render().$el;
        App.execute("ui:modal:show", tr('Shutdown menu'), $content, '', false, 'system');
        return App.listenTo(view, 'system:action', (function(_this) {
          return function(action) {
            switch (action) {
              case 'quit':
                App.request("command:kodi:controller", 'auto', 'Application').quit();
                break;
              case 'shutdown':
                system.shutdown();
                break;
              case 'reboot':
                system.reboot();
                break;
              case 'suspend':
                system.suspend();
                break;
              case 'hibernate':
                system.hibernate();
                break;
            }
            return App.execute("ui:modal:close");
          };
        })(this));
      });
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("InputApp.Remote", function(Remote, App, Backbone, Marionette, $, _) {
  Remote.Control = (function(superClass) {
    extend(Control, superClass);

    function Control() {
      return Control.__super__.constructor.apply(this, arguments);
    }

    Control.prototype.template = 'apps/input/remote/remote_control';

    Control.prototype.events = {
      'click .input-button': 'inputClick',
      'click .player-button': 'playerClick',
      'click .close-remote': 'closeRemote'
    };

    Control.prototype.triggers = {
      'click .power-button': 'remote:power',
      'click .info-button': 'remote:info'
    };

    Control.prototype.inputClick = function(e) {
      var type;
      type = $(e.target).data('type');
      return this.trigger('remote:input', type);
    };

    Control.prototype.playerClick = function(e) {
      var type;
      type = $(e.target).data('type');
      return this.trigger('remote:player', type);
    };

    Control.prototype.closeRemote = function(e) {
      return App.execute("input:remote:toggle");
    };

    Remote.Landing = (function(superClass1) {
      extend(Landing, superClass1);

      function Landing() {
        return Landing.__super__.constructor.apply(this, arguments);
      }

      return Landing;

    })(App.Views.ItemView);

    return Control;

  })(App.Views.ItemView);
  return Remote.System = (function(superClass) {
    extend(System, superClass);

    function System() {
      return System.__super__.constructor.apply(this, arguments);
    }

    System.prototype.template = 'apps/input/remote/system';

    System.prototype.className = 'system-menu';

    System.prototype.events = {
      'click li': 'doAction'
    };

    System.prototype.doAction = function(e) {
      var action;
      action = $(e.target).data('action');
      return this.trigger('system:action', action);
    };

    return System;

  })(App.Views.ItemView);
});

this.Kodi.module("InputApp.Resume", function(Resume, App, Backbone, Marionette, $, _) {
  return Resume.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.resumePlay = function(model, idKey) {
      var $el, complete_string, item, items, len, n, options, percent, resume, resume_string, start_string, stateObj, time_string, title;
      stateObj = App.request("state:current");
      title = t.gettext('Resume playback');
      resume = model.get('resume');
      percent = 0;
      options = [];
      if (parseInt(resume.position) > 0 && stateObj.getPlayer() === 'kodi') {
        percent = helpers.global.getPercent(resume.position, resume.total);
        time_string = helpers.global.formatTime(helpers.global.secToTime(resume.position));
        complete_string = helpers.global.round(percent, 0) + '% ' + t.gettext('complete');
        resume_string = t.gettext('Resume from') + ' <strong>' + time_string + '</strong> <small>' + complete_string + '</small>';
        start_string = t.gettext('Start from the beginning');
        items = [
          {
            title: resume_string,
            percent: percent
          }, {
            title: start_string,
            percent: 0
          }
        ];
        for (n = 0, len = items.length; n < len; n++) {
          item = items[n];
          $el = $('<span>').attr('data-percent', item.percent).text(item.title).click(function(e) {
            return App.execute("command:video:play", model, idKey, $(this).data('percent'));
          });
          options.push($el);
        }
        return App.execute("ui:modal:options", title, options);
      } else {
        return App.execute("command:video:play", model, idKey, 0);
      }
    };

    Controller.prototype.initialize = function() {};

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("LabApp.apiBrowser", function(apiBrowser, App, Backbone, Marionette, $, _) {
  return apiBrowser.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var collection;
      collection = App.request("introspect:entities");
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          collection.dictionary = App.request("introspect:dictionary");
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.renderList(collection);
            if (_this.options.method) {
              return _this.renderPage(_this.options.method, collection);
            } else {
              return _this.renderLanding();
            }
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new apiBrowser.Layout({
        collection: collection
      });
    };

    Controller.prototype.renderList = function(collection) {
      var view;
      view = new apiBrowser.apiMethods({
        collection: collection
      });
      this.listenTo(view, 'childview:lab:apibrowser:method:view', (function(_this) {
        return function(item) {
          return _this.renderPage(item.model.get('id'), collection);
        };
      })(this));
      return this.layout.regionSidebarFirst.show(view);
    };

    Controller.prototype.renderPage = function(id, collection) {
      var model, pageView;
      model = App.request("introspect:entity", id, collection);
      pageView = new apiBrowser.apiMethodPage({
        model: model
      });
      helpers.debug.msg("Params/Returns for " + (model.get('method')) + ":", 'info', [model.get('params'), model.get('returns')]);
      this.listenTo(pageView, 'lab:apibrowser:execute', (function(_this) {
        return function(item) {
          var api, input, method, params;
          input = $('.api-method--params').val();
          params = JSON.parse(input);
          method = item.model.get('method');
          helpers.debug.msg("Parameters for: " + method, 'info', params);
          api = App.request("command:kodi:controller", "auto", "Commander");
          return api.singleCommand(method, params, function(response) {
            var output;
            helpers.debug.msg("Response for: " + method, 'info', response);
            output = prettyPrint(response);
            return $('#api-result').html(output).prepend($('<h3>Response (check the console for more)</h3>'));
          });
        };
      })(this));
      App.navigate("lab/api-browser/" + (model.get('method')));
      return this.layout.regionContent.show(pageView);
    };

    Controller.prototype.renderLanding = function() {
      var view;
      view = new apiBrowser.apiBrowserLanding();
      return this.layout.regionContent.show(view);
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("LabApp.apiBrowser", function(apiBrowser, App, Backbone, Marionette, $, _) {
  apiBrowser.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.className = "api-browser--page page-wrapper";

    return Layout;

  })(App.Views.LayoutWithSidebarFirstView);
  apiBrowser.apiMethodItem = (function(superClass) {
    extend(apiMethodItem, superClass);

    function apiMethodItem() {
      return apiMethodItem.__super__.constructor.apply(this, arguments);
    }

    apiMethodItem.prototype.className = "api-browser--method";

    apiMethodItem.prototype.template = 'apps/lab/apiBrowser/api_method_item';

    apiMethodItem.prototype.tagName = "li";

    apiMethodItem.prototype.triggers = {
      'click .api-method--item': 'lab:apibrowser:method:view'
    };

    return apiMethodItem;

  })(App.Views.ItemView);
  apiBrowser.apiMethods = (function(superClass) {
    extend(apiMethods, superClass);

    function apiMethods() {
      return apiMethods.__super__.constructor.apply(this, arguments);
    }

    apiMethods.prototype.template = 'apps/lab/apiBrowser/api_method_list';

    apiMethods.prototype.childView = apiBrowser.apiMethodItem;

    apiMethods.prototype.childViewContainer = 'ul.items';

    apiMethods.prototype.tagName = "div";

    apiMethods.prototype.className = "api-browser--methods";

    apiMethods.prototype.onRender = function() {
      return $('#api-search', this.$el).filterList({
        items: '.api-browser--methods .api-browser--method',
        textSelector: '.method'
      });
    };

    return apiMethods;

  })(App.Views.CompositeView);
  apiBrowser.apiMethodPage = (function(superClass) {
    extend(apiMethodPage, superClass);

    function apiMethodPage() {
      return apiMethodPage.__super__.constructor.apply(this, arguments);
    }

    apiMethodPage.prototype.className = "api-browser--page";

    apiMethodPage.prototype.template = 'apps/lab/apiBrowser/api_method_page';

    apiMethodPage.prototype.tagName = "div";

    apiMethodPage.prototype.triggers = {
      'click #send-command': 'lab:apibrowser:execute'
    };

    apiMethodPage.prototype.regions = {
      'apiResult': '#api-result'
    };

    apiMethodPage.prototype.onShow = function() {
      $('.api-method--params', this.$el).html(prettyPrint(this.model.get('params')));
      if (this.model.get('type') === 'method') {
        return $('.api-method--return', this.$el).html(prettyPrint(this.model.get('returns')));
      }
    };

    return apiMethodPage;

  })(App.Views.ItemView);
  return apiBrowser.apiBrowserLanding = (function(superClass) {
    extend(apiBrowserLanding, superClass);

    function apiBrowserLanding() {
      return apiBrowserLanding.__super__.constructor.apply(this, arguments);
    }

    apiBrowserLanding.prototype.className = "api-browser--landing";

    apiBrowserLanding.prototype.template = 'apps/lab/apiBrowser/api_browser_landing';

    apiBrowserLanding.prototype.tagName = "div";

    return apiBrowserLanding;

  })(App.Views.ItemView);
});

this.Kodi.module("LabApp.IconBrowser", function(lab, App, Backbone, Marionette, $, _) {
  return lab.IconsPage = (function(superClass) {
    extend(IconsPage, superClass);

    function IconsPage() {
      return IconsPage.__super__.constructor.apply(this, arguments);
    }

    IconsPage.prototype.template = 'apps/lab/iconBrowser/icon_browser_page';

    IconsPage.prototype.tagName = "div";

    IconsPage.prototype.className = "icon-browser page";

    IconsPage.prototype.onRender = function() {
      var $ctx, $ico, icoClass, len, n, name, ref, results1, set, type;
      ref = ['material', 'custom'];
      results1 = [];
      for (n = 0, len = ref.length; n < len; n++) {
        type = ref[n];
        $ctx = $('#icons-' + type, this.$el);
        set = type + 'Icons';
        results1.push((function() {
          var ref1, results2;
          ref1 = this.options[set];
          results2 = [];
          for (icoClass in ref1) {
            name = ref1[icoClass];
            $ico = $('<li><i class="' + icoClass + '"></i><span>' + name + '</span><small>' + icoClass + '</small></li>');
            results2.push($ctx.append($ico));
          }
          return results2;
        }).call(this));
      }
      return results1;
    };

    return IconsPage;

  })(App.Views.LayoutView);
});

this.Kodi.module("LabApp.lab", function(lab, App, Backbone, Marionette, $, _) {
  lab.labItem = (function(superClass) {
    extend(labItem, superClass);

    function labItem() {
      return labItem.__super__.constructor.apply(this, arguments);
    }

    labItem.prototype.className = "lab--item";

    labItem.prototype.template = 'apps/lab/lab/lab_item';

    labItem.prototype.tagName = "div";

    return labItem;

  })(App.Views.ItemView);
  return lab.labItems = (function(superClass) {
    extend(labItems, superClass);

    function labItems() {
      return labItems.__super__.constructor.apply(this, arguments);
    }

    labItems.prototype.tagName = "div";

    labItems.prototype.className = "lab--items page";

    labItems.prototype.childView = lab.labItem;

    labItems.prototype.onRender = function() {
      this.$el.prepend($('<h3>').text(t.gettext('Experimental code, use at own risk')));
      this.$el.prepend($('<h2>').text(t.gettext('The lab')));
      return this.$el.addClass('page-secondary');
    };

    return labItems;

  })(App.Views.CollectionView);
});

this.Kodi.module("LabApp", function(LabApp, App, Backbone, Marionette, $, _) {
  var API;
  LabApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "lab": "labLanding",
      "lab/api-browser": "apiBrowser",
      "lab/api-browser/:method": "apiBrowser",
      "lab/screenshot": "screenShot",
      "lab/icon-browser": "iconBrowser"
    };

    return Router;

  })(App.Router.Base);
  API = {
    labLanding: function() {
      var view;
      view = new LabApp.lab.labItems({
        collection: new App.Entities.NavMainCollection(this.labItems())
      });
      return App.regionContent.show(view);
    },
    labItems: function() {
      return [
        {
          title: 'API browser',
          description: 'Execute any API command.',
          path: 'lab/api-browser'
        }, {
          title: 'Screenshot',
          description: 'Take a screenshot of Kodi right now.',
          path: 'lab/screenshot'
        }, {
          title: 'Icon browser',
          description: 'View all the icons available to Chorus.',
          path: 'lab/icon-browser'
        }
      ];
    },
    apiBrowser: function(method) {
      if (method == null) {
        method = false;
      }
      return new LabApp.apiBrowser.Controller({
        method: method
      });
    },
    screenShot: function() {
      App.execute("input:action", 'screenshot');
      App.execute("notification:show", t.gettext("Screenshot saved to your screenshots folder"));
      return App.navigate("#lab", {
        trigger: true
      });
    },
    iconBrowser: function() {
      return $.getJSON('lib/icons/mdi.json', (function(_this) {
        return function(mdiIcons) {
          return $.getJSON('lib/icons/icomoon.json', function(customIcons) {
            var view;
            console.log(mdiIcons, customIcons);
            view = new LabApp.IconBrowser.IconsPage({
              materialIcons: mdiIcons,
              customIcons: customIcons
            });
            return App.regionContent.show(view);
          });
        };
      })(this));
    }
  };
  return App.on("before:start", function() {
    return new LabApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("LandingApp", function(LandingApp, App, Backbone, Marionette, $, _) {
  var API;
  LandingApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "music": "landingPage",
      "music/top": "landingPage",
      "movies/recent": "landingPage",
      "tvshows/recent": "landingPage",
      "music/genre/:filter": "filteredPage"
    };

    return Router;

  })(App.Router.Base);
  API = {
    landingSettings: {
      music: {
        subnavId: 'music',
        sections: [
          {
            title: 'Recently added albums',
            entity: 'album',
            sort: 'dateadded',
            order: 'descending',
            limit: 14,
            moreLink: 'music/albums?sort=dateadded&order=desc'
          }, {
            title: 'Recently played albums',
            entity: 'album',
            sort: 'lastplayed',
            order: 'descending',
            limit: 14
          }, {
            title: 'Random albums',
            entity: 'album',
            sort: 'random',
            order: 'descending',
            limit: 14,
            moreLink: 'music/albums?sort=random'
          }
        ]
      },
      musictop: {
        subnavId: 'music',
        sections: [
          {
            title: 'Top Albums',
            entity: 'album',
            sort: 'playcount',
            order: 'descending',
            limit: 56,
            filter: {
              'operator': 'greaterthan',
              'field': 'playcount',
              'value': '0'
            }
          }, {
            title: 'Top Songs',
            entity: 'song',
            sort: 'playcount',
            order: 'descending',
            limit: 100,
            filter: {
              'operator': 'greaterthan',
              'field': 'playcount',
              'value': '0'
            }
          }
        ]
      },
      moviesrecent: {
        subnavId: 'movies/recent',
        sections: [
          {
            title: 'Continue watching',
            entity: 'movie',
            sort: 'lastplayed',
            order: 'descending',
            limit: 14,
            filter: {
              'operator': 'true',
              'field': 'inprogress',
              'value': ''
            },
            moreLink: 'movies?sort=dateadded&order=desc&inprogress=in progress'
          }, {
            title: 'Recently added',
            entity: 'movie',
            sort: 'dateadded',
            order: 'descending',
            limit: 14,
            filter: {
              'operator': 'is',
              'field': 'playcount',
              'value': '0'
            },
            moreLink: 'movies?sort=dateadded&order=desc&unwatched=unwatched'
          }, {
            title: 'Random movies',
            entity: 'movie',
            sort: 'random',
            order: 'descending',
            limit: 14,
            moreLink: 'movies?sort=random'
          }
        ]
      },
      tvshowsrecent: {
        subnavId: 'tvshows/recent',
        sections: [
          {
            title: 'Continue watching',
            entity: 'tvshow',
            sort: 'lastplayed',
            order: 'descending',
            limit: 14,
            filter: {
              'operator': 'true',
              'field': 'inprogress',
              'value': ''
            },
            moreLink: 'tvshows?sort=dateadded&order=desc&inprogress=in progress',
            preventSelect: true
          }, {
            title: 'Recently added',
            entity: 'episode',
            sort: 'dateadded',
            order: 'descending',
            limit: 12,
            filter: {
              'operator': 'is',
              'field': 'playcount',
              'value': '0'
            }
          }
        ]
      }
    },
    filteredSettings: {
      musicgenre: {
        subnavId: 'music',
        sections: [
          {
            title: '%1$s Artists',
            entity: 'artist',
            sort: 'title',
            order: 'ascending',
            limit: 500,
            filter: {
              'operator': 'is',
              'field': 'genre',
              'value': '[FILTER]'
            }
          }, {
            title: '%1$s Albums',
            entity: 'album',
            sort: 'title',
            order: 'ascending',
            limit: 500,
            filter: {
              'operator': 'is',
              'field': 'genre',
              'value': '[FILTER]'
            }
          }, {
            title: '%1$s Songs',
            entity: 'song',
            sort: 'title',
            order: 'ascending',
            limit: 1000,
            filter: {
              'operator': 'is',
              'field': 'genre',
              'value': '[FILTER]'
            }
          }
        ]
      }
    },
    landingPage: function() {
      var settings, type;
      type = helpers.url.arg(0) + helpers.url.arg(1);
      settings = API.landingSettings[type];
      return new LandingApp.Show.Controller({
        settings: settings,
        filter: false
      });
    },
    filteredPage: function(filter) {
      var settings, type;
      type = helpers.url.arg(0) + helpers.url.arg(1);
      settings = API.filteredSettings[type];
      return new LandingApp.Show.Controller({
        settings: settings,
        filter: decodeURIComponent(filter)
      });
    }
  };
  return App.on("before:start", function() {
    return new LandingApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("LandingApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      this.renderSection = bind(this.renderSection, this);
      this.getSections = bind(this.getSections, this);
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      this.fanarts = [];
      this.rendered = 0;
      this.settings = options.settings;
      this.layout = this.getLayoutView();
      $('body').addClass('landing-loading');
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          _this.content = _this.getContentView();
          _this.listenTo(_this.content, "show", function() {
            window.scroll(0, 350);
            _this.getSections(_this.settings.sections);
            return _this.getSubNav(_this.settings.subnavId);
          });
          return _this.layout.regionContent.show(_this.content);
        };
      })(this));
      return App.regionContent.show(this.layout);
    };

    Controller.prototype.getLayoutView = function() {
      return new Show.Layout();
    };

    Controller.prototype.getContentView = function() {
      return new Show.Page();
    };

    Controller.prototype.getSubNav = function(subnavId) {
      var subNav;
      subNav = App.request("navMain:children:show", subnavId, 'Sections');
      return this.layout.regionSidebarFirst.show(subNav);
    };

    Controller.prototype.getSections = function(sections) {
      var i, results1, section;
      results1 = [];
      for (i in sections) {
        section = sections[i];
        section.idx = parseInt(i) + 1;
        results1.push(this.getSection(section));
      }
      return results1;
    };

    Controller.prototype.getSection = function(section) {
      var opts;
      section = this.addFilterValue(section);
      opts = {
        sort: {
          method: section.sort,
          order: section.order
        },
        limit: {
          start: 0,
          end: section.limit
        },
        addFields: ['fanart'],
        cache: false,
        success: (function(_this) {
          return function(collection) {
            _this.rendered++;
            if (collection.length > 0) {
              _this.renderSection(section, collection);
              return _this.getFanArts(collection);
            }
          };
        })(this)
      };
      if (section.filter) {
        opts.filter = section.filter;
      }
      return App.request(section.entity + ":entities", opts);
    };

    Controller.prototype.renderSection = function(section, collection) {
      var setView, view;
      view = App.request(section.entity + ":list:view", collection, true);
      setView = new Show.ListSet({
        section: section,
        filter: this.getOption('filter')
      });
      App.listenTo(setView, "show", (function(_this) {
        return function() {
          return setView.regionCollection.show(view);
        };
      })(this));
      App.listenTo(setView, 'landing:set:more', function(viewItem) {
        return App.navigate(viewItem.model.get('section').moreLink, {
          trigger: true
        });
      });
      if (this.content["regionSection" + section.idx]) {
        return this.content["regionSection" + section.idx].show(setView);
      }
    };

    Controller.prototype.addFilterValue = function(section) {
      var filterVal;
      filterVal = this.getOption('filter');
      if (filterVal !== false) {
        if (section.filter && section.filter.value) {
          section.filter.value = filterVal;
        }
      }
      return section;
    };

    Controller.prototype.getFanArts = function(collection) {
      var $hero, item, len, n, randomModel, ref;
      $hero = $("#landing-hero");
      ref = collection.toJSON();
      for (n = 0, len = ref.length; n < len; n++) {
        item = ref[n];
        if (item.fanart && item.fanart !== '') {
          this.fanarts.push(item);
        }
      }
      if ($hero.is(':visible') && this.rendered === this.settings.sections.length && this.fanarts.length > 0) {
        randomModel = this.fanarts[Math.floor(Math.random() * this.fanarts.length)];
        $hero.css('background-image', 'url(' + randomModel.fanart + ')').attr('href', '#' + randomModel.url).attr('title', randomModel.title);
        return $('body').removeClass('landing-loading');
      }
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("LandingApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  Show.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.className = "landing-page";

    return Layout;

  })(App.Views.LayoutWithSidebarFirstView);
  return Show.Page = (function(superClass) {
    extend(Page, superClass);

    function Page() {
      return Page.__super__.constructor.apply(this, arguments);
    }

    Page.prototype.template = "apps/landing/show/landing_page";

    Page.prototype.className = "landing-content";

    Page.prototype.regions = {
      regionHero: '#landing-hero',
      regionSection1: '#landing-section-1',
      regionSection2: '#landing-section-2',
      regionSection3: '#landing-section-3',
      regionSection4: '#landing-section-4',
      regionSection5: '#landing-section-5',
      regionSection6: '#landing-section-6'
    };

    Show.ListSet = (function(superClass1) {
      extend(ListSet, superClass1);

      function ListSet() {
        return ListSet.__super__.constructor.apply(this, arguments);
      }

      ListSet.prototype.className = 'landing-set';

      ListSet.prototype.triggers = {
        'click .more': 'landing:set:more'
      };

      ListSet.prototype.initialize = function() {
        this.setOptions();
        return this.createModel();
      };

      ListSet.prototype.setOptions = function() {
        this.options.menu = {};
        if (this.options.filter !== false && this.options.section.title) {
          this.options.title = t.sprintf(tr(this.options.section.title), this.options.filter);
        } else if (this.options.section.title) {
          this.options.title = tr(this.options.section.title);
        }
        if (this.options.section.moreLink) {
          this.options.menu.more = tr('More like this');
        }
        if (this.options.section.preventSelect) {
          return this.options.noMenuDefault = true;
        }
      };

      return ListSet;

    })(App.Views.SetLayoutView);

    return Page;

  })(App.Views.LayoutView);
});

this.Kodi.module("LoadingApp", function(LoadingApp, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getLoaderView: function(msgTextHtml, inline) {
      if (msgTextHtml == null) {
        msgTextHtml = 'Just a sec...';
      }
      if (inline == null) {
        inline = false;
      }
      return new LoadingApp.Show.Page({
        textHtml: msgTextHtml,
        inline: inline
      });
    }
  };
  App.commands.setHandler("loading:show:view", function(region, msgTextHtml) {
    var view;
    view = API.getLoaderView(msgTextHtml);
    return region.show(view);
  });
  App.commands.setHandler("loading:show:page", function() {
    return App.execute("loading:show:view", App.regionContent);
  });
  return App.reqres.setHandler("loading:get:view", function(msgText, inline) {
    if (inline == null) {
      inline = true;
    }
    return API.getLoaderView(msgText, inline);
  });
});

this.Kodi.module("LoadingApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Page = (function(superClass) {
    extend(Page, superClass);

    function Page() {
      return Page.__super__.constructor.apply(this, arguments);
    }

    Page.prototype.template = "apps/loading/show/loading_page";

    Page.prototype.onRender = function() {
      return this.$el.find('h2').html(this.options.textHtml);
    };

    Page.prototype.attributes = function() {
      if (this.options.inline) {
        return {
          "class": 'loader-inline'
        };
      }
    };

    return Page;

  })(Backbone.Marionette.ItemView);
});

this.Kodi.module("localPlaylistApp.List", function(List, App, Backbone, Marionette, $, _) {
  return List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var id, playlists;
      id = options.id;
      playlists = App.request("localplaylist:entities");
      this.layout = this.getLayoutView(playlists);
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          _this.getListsView(playlists);
          return _this.getItems(id);
        };
      })(this));
      return App.regionContent.show(this.layout);
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.ListLayout({
        collection: collection
      });
    };

    Controller.prototype.getListsView = function(playlists) {
      var view;
      this.sideLayout = new List.SideLayout();
      view = new List.Lists({
        collection: playlists
      });
      App.listenTo(this.sideLayout, "show", (function(_this) {
        return function() {
          if (playlists.length > 0) {
            return _this.sideLayout.regionLists.show(view);
          }
        };
      })(this));
      App.listenTo(this.sideLayout, 'lists:new', function() {
        return App.execute("localplaylist:newlist");
      });
      return this.layout.regionSidebarFirst.show(this.sideLayout);
    };

    Controller.prototype.getItems = function(id) {
      var collection, playlist;
      playlist = App.request("localplaylist:entity", id);
      collection = App.request("localplaylist:item:entities", id);
      this.itemLayout = new List.Layout({
        list: playlist
      });
      App.listenTo(this.itemLayout, "show", (function(_this) {
        return function() {
          var media, view;
          if (collection.length > 0) {
            media = playlist.get('media');
            view = App.request(media + ":list:view", collection, true);
            _this.itemLayout.regionListItems.show(view);
            _this.bindRemove(id, view);
            return _this.initSortable(id, view);
          }
        };
      })(this));
      this.bindLayout(id);
      return this.layout.regionContent.show(this.itemLayout);
    };

    Controller.prototype.bindLayout = function(id) {
      var collection;
      collection = App.request("localplaylist:item:entities", id);
      App.listenTo(this.itemLayout, 'list:clear', function() {
        App.execute("localplaylist:clear:entities", id);
        return App.execute("localplaylist:reload", id);
      });
      App.listenTo(this.itemLayout, 'list:delete', function() {
        App.execute("localplaylist:clear:entities", id);
        App.execute("localplaylist:remove:entity", id);
        return App.navigate("playlists", {
          trigger: true
        });
      });
      App.listenTo(this.itemLayout, 'list:rename', function() {
        return App.execute("localplaylist:rename", id);
      });
      App.listenTo(this.itemLayout, 'list:play', function() {
        var kodiPlaylist;
        kodiPlaylist = App.request("command:kodi:controller", 'audio', 'PlayList');
        return kodiPlaylist.playCollection(collection);
      });
      App.listenTo(this.itemLayout, 'list:localplay', function() {
        var localPlaylist;
        localPlaylist = App.request("command:local:controller", 'audio', 'PlayList');
        return localPlaylist.playCollection(collection);
      });
      return App.listenTo(this.itemLayout, 'list:export', function() {
        return App.execute("playlist:export", collection);
      });
    };

    Controller.prototype.bindRemove = function(id, view) {
      return App.listenTo(view, 'childview:song:remove', (function(_this) {
        return function(parent, viewItem) {
          return _this.updateOrder(id, view.$el, [parent.$el.data('id')]);
        };
      })(this));
    };

    Controller.prototype.initSortable = function(id, view) {
      var self;
      self = this;
      return $('tbody', view.$el).sortable({
        onEnd: (function(_this) {
          return function(e) {
            return self.updateOrder(id, _this.el);
          };
        })(this)
      });
    };

    Controller.prototype.updateOrder = function(playlistId, $ctx, exclude) {
      var order, pos;
      if (exclude == null) {
        exclude = [];
      }
      order = [];
      pos = 0;
      $('tr', $ctx).each(function(i, d) {
        var id;
        id = $(d).data('id');
        if (helpers.global.inArray(id, exclude)) {
          return $(d).remove();
        } else {
          order.push(id);
          $(d).data('id', pos);
          return pos++;
        }
      });
      return App.request("localplaylist:item:updateorder", playlistId, order);
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("localPlaylistApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.className = "local-playlist-list";

    return ListLayout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.SideLayout = (function(superClass) {
    extend(SideLayout, superClass);

    function SideLayout() {
      return SideLayout.__super__.constructor.apply(this, arguments);
    }

    SideLayout.prototype.template = 'apps/localPlaylist/list/playlist_sidebar_layout';

    SideLayout.prototype.tagName = 'div';

    SideLayout.prototype.className = 'side-inner';

    SideLayout.prototype.regions = {
      regionLists: '.current-lists'
    };

    SideLayout.prototype.triggers = {
      'click .new-list': 'lists:new'
    };

    return SideLayout;

  })(App.Views.LayoutView);
  List.List = (function(superClass) {
    extend(List, superClass);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.template = 'apps/localPlaylist/list/playlist';

    List.prototype.tagName = "li";

    List.prototype.initialize = function() {
      var path;
      path = helpers.url.get('playlist', this.model.get('id'));
      this.model.set({
        title: this.model.get('name'),
        path: path
      });
      if (path === helpers.url.path()) {
        return this.model.set({
          active: true
        });
      }
    };

    return List;

  })(App.Views.ItemView);
  List.Lists = (function(superClass) {
    extend(Lists, superClass);

    function Lists() {
      return Lists.__super__.constructor.apply(this, arguments);
    }

    Lists.prototype.template = 'apps/localPlaylist/list/playlist_list';

    Lists.prototype.childView = List.List;

    Lists.prototype.tagName = "div";

    Lists.prototype.childViewContainer = 'ul.lists';

    Lists.prototype.onRender = function() {
      return $('h3', this.$el).text(t.gettext('Playlists'));
    };

    return Lists;

  })(App.Views.CompositeView);
  List.Selection = (function(superClass) {
    extend(Selection, superClass);

    function Selection() {
      return Selection.__super__.constructor.apply(this, arguments);
    }

    Selection.prototype.template = 'apps/localPlaylist/list/playlist';

    Selection.prototype.tagName = "li";

    Selection.prototype.initialize = function() {
      return this.model.set({
        title: this.model.get('name')
      });
    };

    Selection.prototype.triggers = {
      'click .item': 'item:selected'
    };

    return Selection;

  })(App.Views.ItemView);
  List.SelectionList = (function(superClass) {
    extend(SelectionList, superClass);

    function SelectionList() {
      return SelectionList.__super__.constructor.apply(this, arguments);
    }

    SelectionList.prototype.template = 'apps/localPlaylist/list/playlist_list';

    SelectionList.prototype.childView = List.Selection;

    SelectionList.prototype.tagName = "div";

    SelectionList.prototype.className = 'playlist-selection-list';

    SelectionList.prototype.childViewContainer = 'ul.lists';

    SelectionList.prototype.onRender = function() {
      return $('h3', this.$el).text(t.gettext('Existing playlists'));
    };

    return SelectionList;

  })(App.Views.CompositeView);
  return List.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.template = 'apps/localPlaylist/list/playlist_layout';

    Layout.prototype.tagName = 'div';

    Layout.prototype.className = 'local-playlist';

    Layout.prototype.regions = {
      regionListItems: '.item-container'
    };

    Layout.prototype.triggers = {
      'click .local-playlist-header .rename': 'list:rename',
      'click .local-playlist-header .clear': 'list:clear',
      'click .local-playlist-header .delete': 'list:delete',
      'click .local-playlist-header .play': 'list:play',
      'click .local-playlist-header .localplay': 'list:localplay',
      'click .local-playlist-header .export': 'list:export'
    };

    Layout.prototype.onRender = function() {
      if (this.options && this.options.list) {
        return $('h2', this.$el).text(this.options.list.get('name'));
      }
    };

    return Layout;

  })(App.Views.LayoutView);
});

this.Kodi.module("localPlaylistApp", function(localPlaylistApp, App, Backbone, Marionette, $, _) {
  var API;
  localPlaylistApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "playlists": "list",
      "playlist/:id": "list"
    };

    return Router;

  })(App.Router.Base);

  /*
    Main functionality.
   */
  API = {
    playlistNameMsg: 'Give your playlist a name',
    list: function(id) {
      var item, items, lists;
      if (id === null) {
        lists = App.request("localplaylist:entities");
        items = lists.getRawCollection();
        if (_.isEmpty(lists)) {
          id = 0;
        } else {
          item = _.min(items, function(list) {
            return list.id;
          });
          id = item.id;
          App.navigate(helpers.url.get('playlist', id));
        }
      }
      return new localPlaylistApp.List.Controller({
        id: id
      });
    },
    addToList: function(entityType, id) {
      var $content, $new, playlists, view;
      playlists = App.request("localplaylist:entities");
      if (!playlists || playlists.length === 0) {
        return this.createNewList(entityType, id);
      } else {
        view = new localPlaylistApp.List.SelectionList({
          collection: playlists
        });
        $content = view.render().$el;
        $new = $('<button>').text(tr('Create a new list')).addClass('btn btn-primary');
        $new.on('click', (function(_this) {
          return function() {
            return _.defer(function() {
              return API.createNewList(entityType, id);
            });
          };
        })(this));
        App.execute("ui:modal:show", tr('Add to playlist'), $content, $new);
        return App.listenTo(view, 'childview:item:selected', (function(_this) {
          return function(list, item) {
            return _this.addToExistingList(item.model.get('id'), entityType, id);
          };
        })(this));
      }
    },
    addToExistingList: function(playlistId, entityType, ids) {
      var collection;
      if (!_.isArray(ids)) {
        ids = [ids];
      }
      if (helpers.global.inArray(entityType, ['albumid', 'artistid', 'songid'])) {
        return App.request("song:custom:entities", entityType, ids, (function(_this) {
          return function(collection) {
            return _this.addCollectionToList(collection, playlistId);
          };
        })(this));
      } else if (entityType === 'playlist') {
        collection = App.request("playlist:kodi:entities", 'audio');
        return App.execute("when:entity:fetched", collection, (function(_this) {
          return function() {
            return _this.addCollectionToList(collection, playlistId);
          };
        })(this));
      } else {

      }
    },
    addCollectionToList: function(collection, playlistId, notify) {
      if (notify == null) {
        notify = true;
      }
      App.request("localplaylist:item:add:entities", playlistId, collection);
      App.execute("ui:modal:close");
      if (notify === true) {
        return App.execute("notification:show", tr("Added to your playlist"));
      }
    },
    createNewList: function(entityType, id) {
      return App.execute("ui:textinput:show", tr('Add a new playlist'), {
        msg: tr(API.playlistNameMsg)
      }, (function(_this) {
        return function(text) {
          var playlistId;
          if (text !== '') {
            playlistId = App.request("localplaylist:add:entity", text, 'song');
            return _this.addToExistingList(playlistId, entityType, id);
          }
        };
      })(this), false);
    },
    createEmptyList: function() {
      return App.execute("ui:textinput:show", tr('Add a new playlist'), {
        msg: tr(API.playlistNameMsg)
      }, (function(_this) {
        return function(text) {
          var playlistId;
          if (text !== '') {
            playlistId = App.request("localplaylist:add:entity", text, 'song');
            return App.navigate("playlist/" + playlistId, {
              trigger: true
            });
          }
        };
      })(this));
    },
    rename: function(id) {
      var listModel;
      listModel = App.request("localplaylist:entity", id);
      return App.execute("ui:textinput:show", tr('Rename playlist'), {
        msg: tr(API.playlistNameMsg),
        defaultVal: listModel.get('name')
      }, (function(_this) {
        return function(text) {
          listModel.set({
            name: text
          }).save();
          return API.list(id);
        };
      })(this));
    }
  };

  /*
    Listeners.
   */
  App.commands.setHandler("localplaylist:addentity", function(entityType, id) {
    return API.addToList(entityType, id);
  });
  App.commands.setHandler("localplaylist:newlist", function() {
    return API.createEmptyList();
  });
  App.commands.setHandler("localplaylist:reload", function(id) {
    return API.list(id);
  });
  App.commands.setHandler("localplaylist:rename", function(id) {
    return API.rename(id);
  });

  /*
    Init the router
   */
  return App.on("before:start", function() {
    return new localPlaylistApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("MovieApp.Edit", function(Edit, App, Backbone, Marionette, $, _) {
  return Edit.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var form, options;
      this.model = this.getOption('model');
      options = {
        titleHtml: '<span>' + tr('Edit') + '</span>' + this.model.escape('title'),
        form: this.getStructure(),
        formState: this.model.attributes,
        config: {
          attributes: {
            "class": 'edit-form'
          },
          editForm: true,
          tabs: true,
          callback: (function(_this) {
            return function(data, formView) {
              return _this.saveCallback(data, formView);
            };
          })(this)
        }
      };
      return form = App.request("form:popup:wrapper", options);
    };

    Controller.prototype.getStructure = function() {
      return [
        {
          title: 'General',
          id: 'general',
          children: [
            {
              id: 'title',
              title: tr('Title'),
              type: 'textfield'
            }, {
              id: 'plotoutline',
              title: tr('Tagline'),
              type: 'textfield'
            }, {
              id: 'plot',
              title: tr('Plot'),
              type: 'textarea'
            }, {
              id: 'studio',
              title: tr('Studio'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'year',
              title: tr('Year'),
              type: 'number',
              format: 'integer',
              attributes: {
                "class": 'half-width',
                step: 1,
                min: 1000,
                max: 9999
              }
            }, {
              id: 'mpaa',
              title: tr('Content rating'),
              type: 'textfield',
              attributes: {
                "class": 'half-width'
              }
            }, {
              id: 'rating',
              title: tr('Rating'),
              type: 'number',
              format: 'float',
              attributes: {
                "class": 'half-width',
                step: 0.1,
                min: 0,
                max: 10
              }
            }, {
              id: 'imdbnumber',
              title: tr('IMDb'),
              type: 'textfield',
              attributes: {
                "class": 'half-width'
              },
              suffix: '<div class="clearfix"></div>'
            }, {
              id: 'sorttitle',
              title: tr('Sort title'),
              type: 'textfield'
            }, {
              id: 'originaltitle',
              title: tr('Original title'),
              type: 'textfield'
            }
          ]
        }, {
          title: 'Tags',
          id: 'tags',
          children: [
            {
              id: 'director',
              title: tr('Directors'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'writer',
              title: tr('Writers'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'genre',
              title: tr('Genres'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'country',
              title: tr('Country'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'set',
              title: tr('Set'),
              type: 'textfield'
            }, {
              id: 'tag',
              title: tr('Tags'),
              type: 'textarea',
              format: 'array.string'
            }
          ]
        }, {
          title: 'Trailer',
          id: 'trailers',
          children: [
            {
              id: 'trailer',
              title: tr('URL'),
              type: 'imageselect',
              attributes: {
                "class": 'fanart-size'
              },
              description: t.sprintf(tr('This should be the play path for the trailer. Eg. %1$s'), 'plugin://plugin.video.youtube/?action=play_video&videoid=[YOUTUBE_ID]'),
              metadataImageHandler: 'youtube:trailer:entities',
              metadataLookupField: 'title'
            }
          ]
        }, {
          title: 'Poster',
          id: 'poster',
          children: [
            {
              id: 'thumbnail',
              title: tr('URL'),
              type: 'imageselect',
              valueProperty: 'thumbnailOriginal',
              description: tr('Add an image via an external URL'),
              metadataImageHandler: 'themoviedb:movie:image:entities',
              metadataLookupField: 'imdbnumber'
            }
          ]
        }, {
          title: 'Background',
          id: 'background',
          children: [
            {
              id: 'fanart',
              title: tr('URL'),
              type: 'imageselect',
              valueProperty: 'fanartOriginal',
              description: tr('Add an image via an external URL'),
              metadataImageHandler: 'themoviedb:movie:image:entities',
              metadataLookupField: 'imdbnumber'
            }
          ]
        }, {
          title: 'Information',
          id: 'info',
          children: [
            {
              id: 'file',
              title: tr('File path'),
              type: 'textarea',
              attributes: {
                disabled: 'disabled',
                cols: 5
              },
              format: 'prevent.submit'
            }
          ]
        }
      ];
    };

    Controller.prototype.saveCallback = function(data, formView) {
      var controller;
      controller = App.request("command:kodi:controller", 'video', 'VideoLibrary');
      return controller.setMovieDetails(this.model.get('id'), data, (function(_this) {
        return function() {
          Kodi.vent.trigger('entity:kodi:update', _this.model.get('uid'));
          return App.execute("notification:show", t.sprintf(tr("Updated %1$s details"), 'movie'));
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("MovieApp.List", function(List, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getMoviesView: function(collection, set) {
      var view, viewName;
      if (set == null) {
        set = false;
      }
      viewName = set ? 'MoviesSet' : 'Movies';
      view = new List[viewName]({
        collection: collection
      });
      API.bindTriggers(view);
      return view;
    },
    bindTriggers: function(view) {
      App.listenTo(view, 'childview:movie:play', function(parent, viewItem) {
        return App.execute('movie:action', 'play', viewItem);
      });
      App.listenTo(view, 'childview:movie:add', function(parent, viewItem) {
        return App.execute('movie:action', 'add', viewItem);
      });
      App.listenTo(view, 'childview:movie:localplay', function(parent, viewItem) {
        return App.execute('movie:action', 'localplay', viewItem);
      });
      App.listenTo(view, 'childview:movie:download', function(parent, viewItem) {
        return App.execute('movie:action', 'download', viewItem);
      });
      App.listenTo(view, 'childview:movie:watched', function(parent, viewItem) {
        return App.execute('movie:action:watched', parent, viewItem);
      });
      return App.listenTo(view, 'childview:movie:edit', function(parent, viewItem) {
        return App.execute('movie:action', 'edit', viewItem);
      });
    }
  };
  List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var collection;
      collection = App.request("movie:entities");
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          collection.availableFilters = _this.getAvailableFilters();
          collection.sectionId = 'movies/recent';
          App.request('filter:init', _this.getAvailableFilters());
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.renderList(collection);
            return _this.getFiltersView(collection);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.ListLayout({
        collection: collection
      });
    };

    Controller.prototype.getAvailableFilters = function() {
      return {
        sort: ['title', 'year', 'dateadded', 'rating', 'random'],
        filter: ['year', 'genre', 'writer', 'director', 'cast', 'set', 'unwatched', 'inprogress', 'mpaa', 'studio', 'thumbsUp']
      };
    };

    Controller.prototype.getFiltersView = function(collection) {
      var filters;
      filters = App.request('filter:show', collection);
      this.layout.regionSidebarFirst.show(filters);
      return this.listenTo(filters, "filter:changed", (function(_this) {
        return function() {
          return _this.renderList(collection);
        };
      })(this));
    };

    Controller.prototype.renderList = function(collection) {
      var filteredCollection, view;
      App.execute("loading:show:view", this.layout.regionContent);
      filteredCollection = App.request('filter:apply:entities', collection);
      view = API.getMoviesView(filteredCollection);
      return this.layout.regionContent.show(view);
    };

    return Controller;

  })(App.Controllers.Base);
  return App.reqres.setHandler("movie:list:view", function(collection) {
    return API.getMoviesView(collection, true);
  });
});

this.Kodi.module("MovieApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.className = "movie-list with-filters";

    return ListLayout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.MovieTeaser = (function(superClass) {
    extend(MovieTeaser, superClass);

    function MovieTeaser() {
      return MovieTeaser.__super__.constructor.apply(this, arguments);
    }

    MovieTeaser.prototype.triggers = {
      "click .play": "movie:play",
      "click .watched": "movie:watched",
      "click .add": "movie:add",
      "click .localplay": "movie:localplay",
      "click .download": "movie:download",
      "click .edit": "movie:edit"
    };

    MovieTeaser.prototype.initialize = function() {
      MovieTeaser.__super__.initialize.apply(this, arguments);
      this.setMeta();
      if (this.model != null) {
        return this.model.set(App.request('movie:action:items'));
      }
    };

    MovieTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card');
    };

    MovieTeaser.prototype.setMeta = function() {
      if (this.model) {
        return this.model.set({
          subtitleHtml: this.themeLink(this.model.get('year'), 'movies?year=' + this.model.get('year'))
        });
      }
    };

    return MovieTeaser;

  })(App.Views.CardView);
  List.Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.prototype.tagName = "li";

    Empty.prototype.className = "movie-empty-result";

    return Empty;

  })(App.Views.EmptyViewResults);
  List.Movies = (function(superClass) {
    extend(Movies, superClass);

    function Movies() {
      return Movies.__super__.constructor.apply(this, arguments);
    }

    Movies.prototype.childView = List.MovieTeaser;

    Movies.prototype.emptyView = List.Empty;

    Movies.prototype.tagName = "ul";

    Movies.prototype.className = "card-grid--tall";

    return Movies;

  })(App.Views.VirtualListView);
  return List.MoviesSet = (function(superClass) {
    extend(MoviesSet, superClass);

    function MoviesSet() {
      return MoviesSet.__super__.constructor.apply(this, arguments);
    }

    MoviesSet.prototype.childView = List.MovieTeaser;

    MoviesSet.prototype.emptyView = List.Empty;

    MoviesSet.prototype.tagName = "ul";

    MoviesSet.prototype.className = "card-grid--tall";

    return MoviesSet;

  })(App.Views.CollectionView);
});

this.Kodi.module("MovieApp", function(MovieApp, App, Backbone, Marionette, $, _) {
  var API;
  MovieApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "movies": "list",
      "movie/:id": "view"
    };

    return Router;

  })(App.Router.Base);
  API = {
    list: function() {
      return new MovieApp.List.Controller();
    },
    view: function(id) {
      return new MovieApp.Show.Controller({
        id: id
      });
    },
    action: function(op, view) {
      var files, model, playlist, videoLib;
      model = view.model;
      playlist = App.request("command:kodi:controller", 'video', 'PlayList');
      files = App.request("command:kodi:controller", 'video', 'Files');
      videoLib = App.request("command:kodi:controller", 'video', 'VideoLibrary');
      switch (op) {
        case 'play':
          return App.execute("input:resume", model, 'movieid');
        case 'add':
          return playlist.add('movieid', model.get('movieid'));
        case 'localplay':
          return files.videoStream(model.get('file'), model.get('fanart'));
        case 'download':
          return files.downloadFile(model.get('file'));
        case 'toggleWatched':
          return videoLib.toggleWatched(model, 'auto');
        case 'edit':
          return App.execute('movie:edit', model);
        case 'refresh':
          return helpers.entities.refreshEntity(model, videoLib, 'refreshMovie');
      }
    }
  };
  App.reqres.setHandler('movie:action:items', function() {
    return {
      actions: {
        watched: tr('Watched'),
        thumbs: tr('Thumbs up')
      },
      menu: {
        add: tr('Queue in Kodi'),
        'divider-1': '',
        download: tr('Download'),
        localplay: tr('Play in browser'),
        'divider-2': '',
        edit: tr('Edit')
      }
    };
  });
  App.commands.setHandler('movie:action', function(op, view) {
    return API.action(op, view);
  });
  App.commands.setHandler('movie:action:watched', function(parent, viewItem) {
    var op, progress;
    op = parent.$el.hasClass('is-watched') ? 'unwatched' : 'watched';
    progress = op === 'watched' ? 100 : 0;
    parent.$el.toggleClass('is-watched');
    helpers.entities.setProgress(parent.$el, progress);
    helpers.entities.setProgress(parent.$el.closest('.movie-show').find('.region-content-wrapper'), progress);
    return API.action('toggleWatched', viewItem);
  });
  App.commands.setHandler('movie:edit', function(model) {
    var loadedModel;
    loadedModel = App.request("movie:entity", model.get('id'));
    return App.execute("when:entity:fetched", loadedModel, (function(_this) {
      return function() {
        return new MovieApp.Edit.Controller({
          model: loadedModel
        });
      };
    })(this));
  });
  return App.on("before:start", function() {
    return new MovieApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("MovieApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindTriggers: function(view) {
      App.listenTo(view, 'movie:play', function(viewItem) {
        return App.execute('movie:action', 'play', viewItem);
      });
      App.listenTo(view, 'movie:add', function(viewItem) {
        return App.execute('movie:action', 'add', viewItem);
      });
      App.listenTo(view, 'movie:localplay', function(viewItem) {
        return App.execute('movie:action', 'localplay', viewItem);
      });
      App.listenTo(view, 'movie:download', function(viewItem) {
        return App.execute('movie:action', 'download', viewItem);
      });
      App.listenTo(view, 'toggle:watched', function(viewItem) {
        return App.execute('movie:action:watched', viewItem.view, viewItem.view);
      });
      App.listenTo(view, 'movie:refresh', function(viewItem) {
        return App.execute('movie:action', 'refresh', viewItem);
      });
      return App.listenTo(view, 'movie:edit', function(viewItem) {
        return App.execute('movie:edit', viewItem.model);
      });
    },
    moreContent: [
      {
        title: 'More from %1$s',
        filter: 'set',
        key: 'set',
        type: 'string',
        pluck: false
      }, {
        title: 'More %1$s movies',
        filter: 'genre',
        key: 'genre',
        type: 'array',
        pluck: false
      }, {
        title: 'More movies staring %1$s',
        filter: 'actor',
        key: 'cast',
        type: 'array',
        pluck: 'name'
      }, {
        title: 'Other movies released in %1$s',
        filter: 'year',
        key: 'year',
        type: 'string',
        pluck: false
      }
    ]
  };
  return Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var id, movie;
      id = parseInt(options.id);
      movie = App.request("movie:entity", id);
      return App.execute("when:entity:fetched", movie, (function(_this) {
        return function() {
          _this.layout = _this.getLayoutView(movie);
          _this.listenTo(_this.layout, "show", function() {
            _this.getDetailsLayoutView(movie);
            return _this.getContentView(movie);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(movie) {
      return new Show.PageLayout({
        model: movie
      });
    };

    Controller.prototype.getContentView = function(movie) {
      this.contentLayout = new Show.Content({
        model: movie
      });
      this.listenTo(this.contentLayout, "movie:youtube", function(view) {
        var trailer;
        trailer = movie.get('mediaTrailer');
        return App.execute("ui:modal:youtube", movie.escape('title') + ' Trailer', trailer.id);
      });
      this.listenTo(this.contentLayout, 'show', (function(_this) {
        return function() {
          if (movie.get('cast').length > 0) {
            _this.contentLayout.regionCast.show(_this.getCast(movie));
          }
          return _this.getMoreContent(movie);
        };
      })(this));
      return this.layout.regionContent.show(this.contentLayout);
    };

    Controller.prototype.getCast = function(movie) {
      return App.request('cast:list:view', movie.get('cast'), 'movies');
    };

    Controller.prototype.getDetailsLayoutView = function(movie) {
      var headerLayout;
      headerLayout = new Show.HeaderLayout({
        model: movie
      });
      this.listenTo(headerLayout, "show", (function(_this) {
        return function() {
          var detail, teaser;
          teaser = new Show.MovieTeaser({
            model: movie
          });
          API.bindTriggers(teaser);
          detail = new Show.Details({
            model: movie
          });
          API.bindTriggers(detail);
          headerLayout.regionSide.show(teaser);
          return headerLayout.regionMeta.show(detail);
        };
      })(this));
      return this.layout.regionHeader.show(headerLayout);
    };

    Controller.prototype.getMoreContent = function(movie) {
      var filterVal, filterVals, i, idx, more, opts, ref, results1;
      idx = 0;
      ref = API.moreContent;
      results1 = [];
      for (i in ref) {
        more = ref[i];
        filterVal = false;
        if (more.type === 'array') {
          filterVals = more.pluck ? _.pluck(movie.get(more.key), more.pluck) : movie.get(more.key);
          filterVals = _.shuffle(filterVals.slice(0, 4));
          filterVal = _.first(filterVals);
        } else {
          filterVal = movie.get(more.key);
        }
        if (filterVal && filterVal !== '') {
          idx++;
          opts = {
            limit: {
              start: 0,
              end: 6
            },
            cache: false,
            sort: {
              method: 'random',
              order: 'ascending'
            },
            filter: {},
            title: t.sprintf(tr(more.title), '<a href="#movies?' + more.key + '=' + _.escape(filterVal) + '">' + _.escape(filterVal) + '</a>'),
            idx: idx
          };
          opts.filter[more.filter] = filterVal;
          opts.success = (function(_this) {
            return function(collection) {
              var view;
              collection.remove(movie);
              if (collection.length > 0) {
                view = new Show.Set({
                  set: collection.options.title
                });
                App.listenTo(view, "show", function() {
                  var listview;
                  listview = App.request("movie:list:view", collection);
                  return view.regionCollection.show(listview);
                });
                return _this.contentLayout["regionMore" + collection.options.idx].show(view);
              }
            };
          })(this);
          results1.push(App.request("movie:entities", opts));
        } else {
          results1.push(void 0);
        }
      }
      return results1;
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("MovieApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  Show.PageLayout = (function(superClass) {
    extend(PageLayout, superClass);

    function PageLayout() {
      return PageLayout.__super__.constructor.apply(this, arguments);
    }

    PageLayout.prototype.className = 'movie-show detail-container';

    return PageLayout;

  })(App.Views.LayoutWithHeaderView);
  Show.HeaderLayout = (function(superClass) {
    extend(HeaderLayout, superClass);

    function HeaderLayout() {
      return HeaderLayout.__super__.constructor.apply(this, arguments);
    }

    HeaderLayout.prototype.className = 'movie-details';

    return HeaderLayout;

  })(App.Views.LayoutDetailsHeaderView);
  Show.Details = (function(superClass) {
    extend(Details, superClass);

    function Details() {
      return Details.__super__.constructor.apply(this, arguments);
    }

    Details.prototype.template = 'apps/movie/show/details_meta';

    Details.prototype.triggers = {
      'click .play': 'movie:play',
      'click .add': 'movie:add',
      'click .stream': 'movie:localplay',
      'click .download': 'movie:download',
      'click .edit': 'movie:edit',
      'click .refresh': 'movie:refresh'
    };

    Details.prototype.attributes = function() {
      return this.watchedAttributes();
    };

    return Details;

  })(App.Views.DetailsItem);
  Show.MovieTeaser = (function(superClass) {
    extend(MovieTeaser, superClass);

    function MovieTeaser() {
      return MovieTeaser.__super__.constructor.apply(this, arguments);
    }

    MovieTeaser.prototype.tagName = "div";

    MovieTeaser.prototype.triggers = {
      'click .play': 'movie:play'
    };

    MovieTeaser.prototype.initialize = function() {
      return this.model.set({
        actions: {
          thumbs: tr('Thumbs up')
        }
      });
    };

    MovieTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card-detail');
    };

    return MovieTeaser;

  })(App.Views.CardView);
  Show.Content = (function(superClass) {
    extend(Content, superClass);

    function Content() {
      return Content.__super__.constructor.apply(this, arguments);
    }

    Content.prototype.template = 'apps/movie/show/content';

    Content.prototype.className = "movie-content content-sections";

    Content.prototype.triggers = {
      'click .youtube': 'movie:youtube'
    };

    Content.prototype.regions = {
      regionCast: '.region-cast',
      regionMore1: '.region-more-1',
      regionMore2: '.region-more-2',
      regionMore3: '.region-more-3',
      regionMore4: '.region-more-4',
      regionMore5: '.region-more-5'
    };

    Content.prototype.modelEvents = {
      'change': 'modelChange'
    };

    Content.prototype.modelChange = function() {
      this.render();
      return this.trigger('show');
    };

    return Content;

  })(App.Views.LayoutView);
  return Show.Set = (function(superClass) {
    extend(Set, superClass);

    function Set() {
      return Set.__super__.constructor.apply(this, arguments);
    }

    Set.prototype.template = 'apps/movie/show/set';

    Set.prototype.className = 'movie-set';

    Set.prototype.onRender = function() {
      if (this.options && this.options.set) {
        return $('h2.set-name', this.$el).html(this.options.set);
      }
    };

    Set.prototype.regions = function() {
      return {
        regionCollection: '.collection-items'
      };
    };

    return Set;

  })(App.Views.LayoutView);
});

this.Kodi.module("MusicVideoApp.Edit", function(Edit, App, Backbone, Marionette, $, _) {
  return Edit.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var form, options;
      this.model = this.getOption('model');
      options = {
        titleHtml: '<span>' + tr('Edit') + '</span>' + this.model.escape('title'),
        form: this.getStructure(),
        formState: this.model.attributes,
        config: {
          attributes: {
            "class": 'edit-form'
          },
          editForm: true,
          tabs: true,
          callback: (function(_this) {
            return function(data, formView) {
              return _this.saveCallback(data, formView);
            };
          })(this)
        }
      };
      return form = App.request("form:popup:wrapper", options);
    };

    Controller.prototype.getStructure = function() {
      return [
        {
          title: 'General',
          id: 'general',
          children: [
            {
              id: 'title',
              title: tr('Title'),
              type: 'textfield'
            }, {
              id: 'artist',
              title: tr('Artist'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'album',
              title: tr('Album'),
              type: 'textfield'
            }, {
              id: 'plot',
              title: tr('Plot'),
              type: 'textarea'
            }, {
              id: 'studio',
              title: tr('Studio'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'year',
              title: tr('Year'),
              type: 'number',
              format: 'integer',
              attributes: {
                "class": 'half-width',
                step: 1,
                min: 0,
                max: 9999
              }
            }, {
              id: 'rating',
              title: tr('Rating'),
              type: 'number',
              format: 'float',
              attributes: {
                "class": 'half-width',
                step: 0.1,
                min: 0,
                max: 10
              },
              suffix: '<div class="clearfix"></div>'
            }
          ]
        }, {
          title: 'Tags',
          id: 'tags',
          children: [
            {
              id: 'director',
              title: tr('Directors'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'genre',
              title: tr('Genres'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'tag',
              title: tr('Tags'),
              type: 'textfield',
              format: 'array.string'
            }
          ]
        }, {
          title: 'Poster',
          id: 'poster',
          children: [
            {
              id: 'thumbnail',
              title: tr('URL'),
              type: 'imageselect',
              valueProperty: 'thumbnailOriginal',
              description: tr('Add an image via an external URL'),
              attributes: {
                "class": 'fanart-size'
              },
              metadataImageHandler: 'fanarttv:artist:image:entities',
              metadataLookupField: 'artist'
            }
          ]
        }, {
          title: 'Background',
          id: 'background',
          children: [
            {
              id: 'fanart',
              title: tr('URL'),
              type: 'imageselect',
              valueProperty: 'fanartOriginal',
              description: tr('Add an image via an external URL'),
              metadataImageHandler: 'fanarttv:artist:image:entities',
              metadataLookupField: 'artist'
            }
          ]
        }, {
          title: 'Information',
          id: 'info',
          children: [
            {
              id: 'file',
              title: tr('File path'),
              type: 'textarea',
              attributes: {
                disabled: 'disabled',
                cols: 5
              },
              format: 'prevent.submit'
            }
          ]
        }
      ];
    };

    Controller.prototype.saveCallback = function(data, formView) {
      var controller;
      controller = App.request("command:kodi:controller", 'audio', 'VideoLibrary');
      return controller.setMusicVideoDetails(this.model.get('id'), data, (function(_this) {
        return function() {
          Kodi.vent.trigger('entity:kodi:update', _this.model.get('uid'));
          return Kodi.execute("notification:show", t.sprintf(tr("Updated %1$s details"), 'album'));
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("MusicVideoApp.List", function(List, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindTriggers: function(view) {
      App.listenTo(view, 'childview:musicvideo:play', function(parent, viewItem) {
        return App.execute('musicvideo:action', 'play', viewItem);
      });
      App.listenTo(view, 'childview:musicvideo:add', function(parent, viewItem) {
        return App.execute('musicvideo:action', 'add', viewItem);
      });
      App.listenTo(view, 'childview:musicvideo:localplay', function(parent, viewItem) {
        return App.execute('musicvideo:action', 'localplay', viewItem);
      });
      App.listenTo(view, 'childview:musicvideo:download', function(parent, viewItem) {
        return App.execute('musicvideo:action', 'download', viewItem);
      });
      App.listenTo(view, 'childview:musicvideo:edit', function(parent, viewItem) {
        return App.execute('musicvideo:edit', viewItem.model);
      });
      return view;
    },
    getVideoList: function(collection) {
      var view;
      view = new List.Videos({
        collection: collection
      });
      API.bindTriggers(view);
      return view;
    }
  };
  List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var collection;
      collection = App.request("musicvideo:entities");
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          collection.availableFilters = _this.getAvailableFilters();
          collection.sectionId = 'music';
          App.request('filter:init', _this.getAvailableFilters());
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.renderList(collection);
            return _this.getFiltersView(collection);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.ListLayout({
        collection: collection
      });
    };

    Controller.prototype.getAvailableFilters = function() {
      return {
        sort: ['label', 'year', 'artist', 'album'],
        filter: ['studio', 'director', 'artist', 'album', 'year']
      };
    };

    Controller.prototype.getFiltersView = function(collection) {
      var filters;
      filters = App.request('filter:show', collection);
      this.layout.regionSidebarFirst.show(filters);
      return this.listenTo(filters, "filter:changed", (function(_this) {
        return function() {
          return _this.renderList(collection);
        };
      })(this));
    };

    Controller.prototype.renderList = function(collection) {
      var filteredCollection, view;
      App.execute("loading:show:view", this.layout.regionContent);
      filteredCollection = App.request('filter:apply:entities', collection);
      view = API.getVideoList(filteredCollection);
      return this.layout.regionContent.show(view);
    };

    return Controller;

  })(App.Controllers.Base);
  return App.reqres.setHandler("musicvideo:list:view", function(collection) {
    return API.getVideoList(collection);
  });
});

this.Kodi.module("MusicVideoApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.className = "musicvideo-list with-filters";

    return ListLayout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.Teaser = (function(superClass) {
    extend(Teaser, superClass);

    function Teaser() {
      return Teaser.__super__.constructor.apply(this, arguments);
    }

    Teaser.prototype.triggers = {
      "click .play": "musicvideo:play",
      "click .add": "musicvideo:add",
      'click .stream': 'musicvideo:localplay',
      'click .download': 'musicvideo:download',
      'click .edit': 'musicvideo:edit',
      'click .refresh': 'musicvideo:refresh'
    };

    Teaser.prototype.initialize = function() {
      Teaser.__super__.initialize.apply(this, arguments);
      if (this.model != null) {
        this.setMeta();
        return this.model.set(App.request('musicvideo:action:items'));
      }
    };

    Teaser.prototype.setMeta = function() {
      if (this.model) {
        return this.model.set({
          subtitleHtml: this.themeLink(this.model.get('artist'), 'search/artist/' + artist)
        });
      }
    };

    return Teaser;

  })(App.Views.CardView);
  List.Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.prototype.tagName = "li";

    Empty.prototype.className = "musicvideo-empty-result";

    return Empty;

  })(App.Views.EmptyViewResults);
  return List.Videos = (function(superClass) {
    extend(Videos, superClass);

    function Videos() {
      return Videos.__super__.constructor.apply(this, arguments);
    }

    Videos.prototype.childView = List.Teaser;

    Videos.prototype.emptyView = List.Empty;

    Videos.prototype.tagName = "ul";

    Videos.prototype.className = "card-grid--musicvideo";

    return Videos;

  })(App.Views.VirtualListView);
});

this.Kodi.module("MusicVideoApp", function(MusicVideoApp, App, Backbone, Marionette, $, _) {
  var API;
  MusicVideoApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "music/videos": "list",
      "music/video/:id": "view"
    };

    return Router;

  })(App.Router.Base);
  API = {
    list: function() {
      return new MusicVideoApp.List.Controller();
    },
    view: function(id) {
      return new MusicVideoApp.Show.Controller({
        id: id
      });
    },
    action: function(op, view) {
      var files, model, playlist, videoLib;
      model = view.model;
      playlist = App.request("command:kodi:controller", 'video', 'PlayList');
      files = App.request("command:kodi:controller", 'video', 'Files');
      videoLib = App.request("command:kodi:controller", 'video', 'VideoLibrary');
      switch (op) {
        case 'play':
          return App.execute("input:resume", model, 'musicvideoid');
        case 'add':
          return playlist.add('musicvideoid', model.get('musicvideoid'));
        case 'localplay':
          return files.videoStream(model.get('file'), model.get('fanart'));
        case 'download':
          return files.downloadFile(model.get('file'));
        case 'refresh':
          return helpers.entities.refreshEntity(model, videoLib, 'refreshMusicVideo');
      }
    }
  };
  App.on("before:start", function() {
    return new MusicVideoApp.Router({
      controller: API
    });
  });
  App.commands.setHandler('musicvideo:action', function(op, model) {
    return API.action(op, model);
  });
  App.reqres.setHandler('musicvideo:action:items', function() {
    return {
      actions: {
        thumbs: tr('Thumbs up')
      },
      menu: {
        'add': tr('Queue in Kodi'),
        'divider-1': '',
        'download': tr('Download'),
        'stream': tr('Play in browser'),
        'divider-2': '',
        'edit': tr('Edit')
      }
    };
  });
  return App.commands.setHandler('musicvideo:edit', function(model) {
    var loadedModel;
    loadedModel = App.request("musicvideo:entity", model.get('id'));
    return App.execute("when:entity:fetched", loadedModel, (function(_this) {
      return function() {
        return new MusicVideoApp.Edit.Controller({
          model: loadedModel
        });
      };
    })(this));
  });
});

this.Kodi.module("MusicVideoApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindTriggers: function(view) {
      App.listenTo(view, 'musicvideo:play', function(viewItem) {
        return App.execute('musicvideo:action', 'play', viewItem);
      });
      App.listenTo(view, 'musicvideo:add', function(viewItem) {
        return App.execute('musicvideo:action', 'add', viewItem);
      });
      App.listenTo(view, 'musicvideo:localplay', function(viewItem) {
        return App.execute('musicvideo:action', 'localplay', viewItem);
      });
      App.listenTo(view, 'musicvideo:download', function(viewItem) {
        return App.execute('musicvideo:action', 'download', viewItem);
      });
      App.listenTo(view, 'musicvideo:edit', function(viewItem) {
        return App.execute('musicvideo:edit', viewItem.model);
      });
      return view;
    }
  };
  return Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var id, musicvideo;
      id = parseInt(options.id);
      musicvideo = App.request("musicvideo:entity", id);
      return App.execute("when:entity:fetched", musicvideo, (function(_this) {
        return function() {
          _this.layout = _this.getLayoutView(musicvideo);
          _this.listenTo(_this.layout, "show", function() {
            _this.getDetailsLayoutView(musicvideo);
            return _this.getRelatedVideos(musicvideo);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(musicvideo) {
      return new Show.PageLayout({
        model: musicvideo
      });
    };

    Controller.prototype.getDetailsLayoutView = function(musicvideo) {
      var headerLayout;
      headerLayout = new Show.HeaderLayout({
        model: musicvideo
      });
      this.listenTo(headerLayout, "show", (function(_this) {
        return function() {
          var detail, teaser;
          teaser = new Show.DetailTeaser({
            model: musicvideo
          });
          API.bindTriggers(teaser);
          detail = new Show.Details({
            model: musicvideo
          });
          _this.listenTo(detail, "show", function() {
            return API.bindTriggers(detail);
          });
          headerLayout.regionSide.show(teaser);
          return headerLayout.regionMeta.show(detail);
        };
      })(this));
      return this.layout.regionHeader.show(headerLayout);
    };

    Controller.prototype.getRelatedVideos = function(musicvideo) {
      var opts, title;
      title = tr('Related music videos from YouTube');
      opts = {
        maxResults: 8
      };
      return App.execute('youtube:list:view', musicvideo.get('title') + ' ' + musicvideo.get('artist'), title, opts, (function(_this) {
        return function(view) {
          return _this.layout.regionContent.show(view);
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("MusicVideoApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  Show.PageLayout = (function(superClass) {
    extend(PageLayout, superClass);

    function PageLayout() {
      return PageLayout.__super__.constructor.apply(this, arguments);
    }

    PageLayout.prototype.className = 'musicvideo-show detail-container';

    return PageLayout;

  })(App.Views.LayoutWithHeaderView);
  Show.HeaderLayout = (function(superClass) {
    extend(HeaderLayout, superClass);

    function HeaderLayout() {
      return HeaderLayout.__super__.constructor.apply(this, arguments);
    }

    HeaderLayout.prototype.className = 'musicvideo-details';

    return HeaderLayout;

  })(App.Views.LayoutDetailsHeaderView);
  Show.Details = (function(superClass) {
    extend(Details, superClass);

    function Details() {
      return Details.__super__.constructor.apply(this, arguments);
    }

    Details.prototype.template = 'apps/musicvideo/show/details_meta';

    Details.prototype.triggers = {
      "click .play": "musicvideo:play",
      "click .add": "musicvideo:add",
      "click .download": "musicvideo:download",
      "click .localplay": "musicvideo:localplay",
      "click .edit": "musicvideo:edit"
    };

    return Details;

  })(App.Views.DetailsItem);
  return Show.DetailTeaser = (function(superClass) {
    extend(DetailTeaser, superClass);

    function DetailTeaser() {
      return DetailTeaser.__super__.constructor.apply(this, arguments);
    }

    DetailTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card-detail');
    };

    return DetailTeaser;

  })(App.MusicVideoApp.List.Teaser);
});

this.Kodi.module("NavMain", function(NavMain, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getNav: function() {
      var navStructure;
      navStructure = App.request('navMain:entities');
      return new NavMain.List({
        collection: navStructure
      });
    },
    getNavChildren: function(path, title) {
      var navStructure;
      if (title == null) {
        title = 'default';
      }
      navStructure = App.request('navMain:entities', path);
      if (title !== 'default') {
        navStructure.set({
          title: tr(title)
        });
      }
      return new NavMain.ItemList({
        model: navStructure
      });
    },
    getNavCollection: function(collection, title) {
      var navStructure;
      navStructure = new App.Entities.NavMain({
        title: title,
        items: collection
      });
      return new NavMain.ItemList({
        model: navStructure
      });
    }
  };
  this.onStart = function(options) {
    return App.vent.on("shell:ready", (function(_this) {
      return function(options) {
        var nav;
        nav = API.getNav();
        return App.regionNav.show(nav);
      };
    })(this));
  };
  App.reqres.setHandler("navMain:children:show", function(path, title) {
    if (title == null) {
      title = 'default';
    }
    return API.getNavChildren(path, title);
  });
  App.reqres.setHandler("navMain:collection:show", function(collection, title) {
    if (title == null) {
      title = '';
    }
    return API.getNavCollection(collection, title);
  });
  return App.vent.on("navMain:refresh", function() {
    var nav;
    nav = API.getNav();
    return App.regionNav.show(nav);
  });
});

this.Kodi.module("NavMain", function(NavMain, App, Backbone, Marionette, $, _) {
  NavMain.List = (function(superClass) {
    extend(List, superClass);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.template = "apps/navMain/show/navMain";

    return List;

  })(Backbone.Marionette.ItemView);
  NavMain.Item = (function(superClass) {
    extend(Item, superClass);

    function Item() {
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.prototype.template = "apps/navMain/show/nav_item";

    Item.prototype.tagName = "li";

    Item.prototype.initialize = function() {
      var classes, tag;
      classes = [];
      if (this.model.get('path') === helpers.url.path()) {
        classes.push('active');
      }
      tag = this.themeLink(this.model.get('title'), this.model.get('path'), {
        'className': classes.join(' ')
      });
      return this.model.set({
        link: tag
      });
    };

    return Item;

  })(Backbone.Marionette.ItemView);
  return NavMain.ItemList = (function(superClass) {
    extend(ItemList, superClass);

    function ItemList() {
      return ItemList.__super__.constructor.apply(this, arguments);
    }

    ItemList.prototype.template = 'apps/navMain/show/nav_sub';

    ItemList.prototype.childView = NavMain.Item;

    ItemList.prototype.tagName = "div";

    ItemList.prototype.childViewContainer = 'ul.items';

    ItemList.prototype.className = "nav-sub";

    ItemList.prototype.initialize = function() {
      return this.collection = this.model.get('items');
    };

    return ItemList;

  })(App.Views.CompositeView);
});

this.Kodi.module("NotificationsApp", function(NotificationApp, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    notificationMinTimeOut: 5000
  };
  return App.commands.setHandler("notification:show", function(msg, severity) {
    var timeout;
    if (severity == null) {
      severity = 'normal';
    }
    timeout = msg.length < 50 ? API.notificationMinTimeOut : msg.length * 100;
    return $.snackbar({
      content: msg,
      style: 'type-' + severity,
      timeout: timeout
    });
  });
});

this.Kodi.module("PlayerApp", function(PlayerApp, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getPlayer: function(player) {
      return new PlayerApp.Show.Player({
        player: player
      });
    },
    doCommand: function(player, command, params, callback) {
      return App.request("command:" + player + ":player", command, params, (function(_this) {
        return function() {
          return _this.pollingUpdate(callback);
        };
      })(this));
    },
    getAppController: function(player) {
      return App.request("command:" + player + ":controller", 'auto', 'Application');
    },
    pollingUpdate: function(callback) {
      var stateObj;
      stateObj = App.request("state:current");
      if (stateObj.getPlayer() === 'kodi') {
        if (!App.request('sockets:active')) {
          return App.request('state:kodi:update', callback);
        }
      } else {

      }
    },
    initPlayer: function(player, playerView) {
      var $playerCtx, $progress, $volume, appController;
      this.initProgress(player);
      this.initVolume(player);
      App.vent.trigger("state:player:updated", player);
      appController = this.getAppController(player);
      App.vent.on("state:initialized", (function(_this) {
        return function() {
          var stateObj;
          stateObj = App.request("state:kodi");
          if (stateObj.isPlaying()) {
            _this.timerStop();
            return _this.timerStart();
          }
        };
      })(this));
      App.listenTo(playerView, "control:play", (function(_this) {
        return function() {
          return _this.doCommand(player, 'PlayPause', 'toggle');
        };
      })(this));
      App.listenTo(playerView, "control:prev", (function(_this) {
        return function() {
          return _this.doCommand(player, 'GoTo', 'previous');
        };
      })(this));
      App.listenTo(playerView, "control:next", (function(_this) {
        return function() {
          return _this.doCommand(player, 'GoTo', 'next');
        };
      })(this));
      App.listenTo(playerView, "control:repeat", (function(_this) {
        return function() {
          return _this.doCommand(player, 'SetRepeat', 'cycle');
        };
      })(this));
      App.listenTo(playerView, "control:shuffle", (function(_this) {
        return function() {
          return _this.doCommand(player, 'SetShuffle', 'toggle');
        };
      })(this));
      App.listenTo(playerView, "control:mute", (function(_this) {
        return function() {
          return appController.toggleMute(function() {
            return _this.pollingUpdate();
          });
        };
      })(this));
      App.listenTo(playerView, 'control:menu', function() {
        return App.execute("ui:playermenu", 'toggle');
      });
      if (player === 'kodi') {
        App.listenTo(playerView, "remote:toggle", (function(_this) {
          return function() {
            return App.execute("input:remote:toggle");
          };
        })(this));
      }
      $playerCtx = $('#player-' + player);
      $progress = $('.playing-progress', $playerCtx);
      if (player === 'kodi') {
        $progress.on('change', function() {
          API.timerStop();
          return API.doCommand(player, 'Seek', Math.round(this.vGet()), function() {
            return API.timerStart();
          });
        });
        $progress.on('slide', function() {
          return API.timerStop();
        });
      } else {
        $progress.on('change', function() {
          return API.doCommand(player, 'Seek', Math.round(this.vGet()));
        });
      }
      $volume = $('.volume', $playerCtx);
      return $volume.on('change', function() {
        return appController.setVolume(Math.round(this.vGet()), function() {
          return API.pollingUpdate();
        });
      });
    },
    timerStart: function() {
      return App.playingTimerInterval = setTimeout(((function(_this) {
        return function() {
          return _this.timerUpdate();
        };
      })(this)), 1000);
    },
    timerStop: function() {
      return clearTimeout(App.playingTimerInterval);
    },
    timerUpdate: function() {
      var cur, curTimeObj, dur, percent, stateObj;
      stateObj = App.request("state:kodi");
      this.timerStop();
      if (stateObj.isPlaying() && (stateObj.getPlaying('time') != null)) {
        cur = helpers.global.timeToSec(stateObj.getPlaying('time')) + 1;
        dur = helpers.global.timeToSec(stateObj.getPlaying('totaltime'));
        percent = Math.ceil(cur / dur * 100);
        curTimeObj = helpers.global.secToTime(cur);
        stateObj.setPlaying('time', curTimeObj);
        this.setProgress('kodi', percent, curTimeObj);
        return this.timerStart();
      }
    },
    setProgress: function(player, percent, currentTime) {
      var $cur, $playerCtx;
      if (percent == null) {
        percent = 0;
      }
      if (currentTime == null) {
        currentTime = 0;
      }
      $playerCtx = $('#player-' + player);
      $('.playing-progress', $playerCtx).val(percent);
      $cur = $('.playing-time-current', $playerCtx);
      return $cur.text(helpers.global.formatTime(currentTime));
    },
    initProgress: function(player, percent) {
      var $playerCtx;
      if (percent == null) {
        percent = 0;
      }
      $playerCtx = $('#player-' + player);
      return $('.playing-progress', $playerCtx).noUiSlider({
        start: percent,
        connect: 'upper',
        step: 1,
        range: {
          min: 0,
          max: 100
        }
      });
    },
    initVolume: function(player, percent) {
      var $playerCtx;
      if (percent == null) {
        percent = 50;
      }
      $playerCtx = $('#player-' + player);
      return $('.volume', $playerCtx).noUiSlider({
        start: percent,
        connect: 'upper',
        step: 1,
        range: {
          min: 0,
          max: 100
        }
      });
    }
  };
  return this.onStart = function(options) {
    App.vent.on("shell:ready", (function(_this) {
      return function(options) {
        App.kodiPlayer = API.getPlayer('kodi');
        App.listenTo(App.kodiPlayer, "show", function() {
          API.initPlayer('kodi', App.kodiPlayer);
          return App.execute("player:kodi:timer", 'start');
        });
        App.regionPlayerKodi.show(App.kodiPlayer);
        App.localPlayer = API.getPlayer('local');
        App.listenTo(App.localPlayer, "show", function() {
          return API.initPlayer('local', App.localPlayer);
        });
        return App.regionPlayerLocal.show(App.localPlayer);
      };
    })(this));
    App.commands.setHandler('player:kodi:timer', function(state) {
      if (state == null) {
        state = 'start';
      }
      if (state === 'start') {
        return API.timerStart();
      } else if (state === 'stop') {
        return API.timerStop();
      } else if (state === 'update') {
        return API.timerUpdate();
      }
    });
    App.commands.setHandler('player:local:progress:update', function(percent, currentTime) {
      return API.setProgress('local', percent, currentTime);
    });
    return App.commands.setHandler('player:kodi:progress:update', function(percent, callback) {
      return API.doCommand('kodi', 'Seek', percent, callback);
    });
  };
});

this.Kodi.module("PlayerApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Player = (function(superClass) {
    extend(Player, superClass);

    function Player() {
      return Player.__super__.constructor.apply(this, arguments);
    }

    Player.prototype.template = "apps/player/show/player";

    Player.prototype.regions = {
      regionProgress: '.playing-progress',
      regionVolume: '.volume',
      regionThumbnail: '.playing-thumb',
      regionTitle: '.playing-title',
      regionSubtitle: '.playing-subtitle',
      regionTimeCur: '.playing-time-current',
      regionTimeDur: '.playing-time-duration'
    };

    Player.prototype.triggers = {
      'click .remote-toggle': 'remote:toggle',
      'click .control-prev': 'control:prev',
      'click .control-play': 'control:play',
      'click .control-next': 'control:next',
      'click .control-stop': 'control:stop',
      'click .control-mute': 'control:mute',
      'click .control-shuffle': 'control:shuffle',
      'click .control-repeat': 'control:repeat',
      'click .control-menu': 'control:menu'
    };

    return Player;

  })(App.Views.ItemView);
});

this.Kodi.module("PlaylistApp.List", function(List, App, Backbone, Marionette, $, _) {
  return List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      return App.vent.on("shell:ready", (function(_this) {
        return function(options) {
          return _this.getPlaylistBar();
        };
      })(this));
    };

    Controller.prototype.playlistController = function(player, media) {
      return App.request("command:" + player + ":controller", media, 'PlayList');
    };

    Controller.prototype.playerController = function(player, media) {
      return App.request("command:" + player + ":controller", media, 'Player');
    };

    Controller.prototype.playerCommand = function(player, command, params) {
      if (params == null) {
        params = [];
      }
      return App.request("command:" + player + ":player", command, params, function() {
        return App.request("state:kodi:update");
      });
    };

    Controller.prototype.stateObj = function() {
      return App.request("state:current");
    };

    Controller.prototype.getPlaylistBar = function() {
      this.layout = this.getLayout();
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          _this.renderList('kodi', 'audio');
          _this.renderList('local', 'audio');
          return App.vent.on("state:initialized", function() {
            return _this.changePlaylist(_this.stateObj().getState('player'), _this.stateObj().getState('media'));
          });
        };
      })(this));
      this.listenTo(this.layout, 'playlist:kodi:audio', (function(_this) {
        return function() {
          return _this.changePlaylist('kodi', 'audio');
        };
      })(this));
      this.listenTo(this.layout, 'playlist:kodi:video', (function(_this) {
        return function() {
          return _this.changePlaylist('kodi', 'video');
        };
      })(this));
      this.listenTo(this.layout, 'playlist:kodi', (function(_this) {
        return function() {
          _this.stateObj().setPlayer('kodi');
          return _this.renderList('kodi', 'audio');
        };
      })(this));
      this.listenTo(this.layout, 'playlist:local', (function(_this) {
        return function() {
          _this.stateObj().setPlayer('local');
          return _this.renderList('local', 'audio');
        };
      })(this));
      this.listenTo(this.layout, 'playlist:clear', (function(_this) {
        return function() {
          return _this.playlistController(_this.stateObj().getPlayer(), _this.stateObj().getState('media')).clear();
        };
      })(this));
      this.listenTo(this.layout, 'playlist:refresh', (function(_this) {
        return function() {
          _this.renderList(_this.stateObj().getPlayer(), _this.stateObj().getState('media'));
          return App.execute("notification:show", tr('Playlist refreshed'));
        };
      })(this));
      this.listenTo(this.layout, 'playlist:party', (function(_this) {
        return function() {
          return _this.playerController(_this.stateObj().getPlayer(), _this.stateObj().getState('media')).setPartyMode('toggle', function(resp) {
            App.request("state:" + _this.stateObj().getPlayer() + ":update");
            return App.execute("notification:show", t.sprintf(tr('%1$s party mode toggled'), _this.stateObj().getPlayer()));
          });
        };
      })(this));
      this.listenTo(this.layout, 'playlist:save', (function(_this) {
        return function() {
          return App.execute("localplaylist:addentity", 'playlist');
        };
      })(this));
      return App.regionPlaylist.show(this.layout);
    };

    Controller.prototype.getLayout = function() {
      return new List.Layout();
    };

    Controller.prototype.getList = function(collection) {
      return new List.Items({
        collection: collection
      });
    };

    Controller.prototype.renderList = function(type, media) {
      var collection, listView;
      this.layout.$el.removeClassStartsWith('media-').addClass('media-' + media);
      if (type === 'kodi') {
        collection = App.request("playlist:list", type, media);
        return App.execute("when:entity:fetched", collection, (function(_this) {
          return function() {
            var listView;
            listView = _this.getList(collection);
            App.listenTo(listView, "show", function() {
              _this.bindActions(listView, type, media);
              return App.vent.trigger("state:content:updated", type, media);
            });
            return _this.layout.kodiPlayList.show(listView);
          };
        })(this));
      } else {
        collection = App.request("localplayer:get:entities");
        listView = this.getList(collection);
        App.listenTo(listView, "show", (function(_this) {
          return function() {
            _this.bindActions(listView, type, media);
            return App.vent.trigger("state:content:updated", type, media);
          };
        })(this));
        return this.layout.localPlayList.show(listView);
      }
    };

    Controller.prototype.bindActions = function(listView, type, media) {
      var playlist;
      playlist = this.playlistController(type, media);
      this.listenTo(listView, "childview:playlist:item:remove", function(playlistView, item) {
        return playlist.remove(item.model.get('position'));
      });
      this.listenTo(listView, "childview:playlist:item:play", function(playlistView, item) {
        return playlist.playEntity('position', parseInt(item.model.get('position')));
      });
      return this.initSortable(type, media);
    };

    Controller.prototype.changePlaylist = function(player, media) {
      return this.renderList(player, media);
    };

    Controller.prototype.initSortable = function(type, media) {
      var $ctx, playlist;
      $ctx = $('.' + type + '-playlist');
      playlist = this.playlistController(type, media);
      return $('ul.playlist-items', $ctx).sortable({
        filter: '.row-playing,.row-paused',
        onEnd: function(e) {
          return playlist.moveItem($(e.item).data('type'), $(e.item).data('id'), e.oldIndex, e.newIndex);
        }
      });
    };

    Controller.prototype.focusPlaying = function(type, media) {
      var $playing;
      if (config.getLocal('playlistFocusPlaying', true)) {
        $playing = $('.' + type + '-playlist .row-playing');
        if ($playing.length > 0) {
          return $playing.get(0).scrollIntoView();
        }
      }
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("PlaylistApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.template = "apps/playlist/list/playlist_bar";

    Layout.prototype.tagName = "div";

    Layout.prototype.className = "playlist-bar";

    Layout.prototype.regions = {
      kodiPlayList: '.kodi-playlist',
      localPlayList: '.local-playlist'
    };

    Layout.prototype.triggers = {
      'click .kodi-playlists .media-toggle .video': 'playlist:kodi:video',
      'click .kodi-playlists .media-toggle .audio': 'playlist:kodi:audio',
      'click .player-toggle .kodi': 'playlist:kodi',
      'click .player-toggle .local': 'playlist:local',
      'click .clear-playlist': 'playlist:clear',
      'click .refresh-playlist': 'playlist:refresh',
      'click .party-mode': 'playlist:party',
      'click .save-playlist': 'playlist:save'
    };

    Layout.prototype.events = {
      'click .playlist-menu a': 'menuClick'
    };

    Layout.prototype.menuClick = function(e) {
      return e.preventDefault();
    };

    return Layout;

  })(App.Views.LayoutView);
  List.Item = (function(superClass) {
    extend(Item, superClass);

    function Item() {
      return Item.__super__.constructor.apply(this, arguments);
    }

    Item.prototype.template = "apps/playlist/list/playlist_item";

    Item.prototype.tagName = "li";

    Item.prototype.initialize = function() {
      var subtitle;
      subtitle = '';
      switch (this.model.get('type')) {
        case 'song':
          subtitle = this.model.get('artist') ? this.model.get('artist').join(', ') : '';
          break;
        default:
          subtitle = '';
      }
      return this.model.set({
        subtitle: subtitle
      });
    };

    Item.prototype.triggers = {
      "click .remove": "playlist:item:remove",
      "click .play": "playlist:item:play"
    };

    Item.prototype.events = {
      "click .thumbs": "toggleThumbs"
    };

    Item.prototype.attributes = function() {
      var classes;
      classes = ['item', 'pos-' + this.model.get('position'), 'plitem-' + this.model.get('type') + '-' + this.model.get('id')];
      if (this.model.get('canThumbsUp') && App.request('thumbsup:check', this.model)) {
        classes.push('thumbs-up');
      }
      return {
        "class": classes.join(' '),
        'data-type': this.model.get('type'),
        'data-id': this.model.get('id'),
        'data-pos': this.model.get('position')
      };
    };

    Item.prototype.toggleThumbs = function() {
      App.request("thumbsup:toggle:entity", this.model);
      this.$el.toggleClass('thumbs-up');
      return $('.item-' + this.model.get('type') + '-' + this.model.get('id')).toggleClass('thumbs-up');
    };

    return Item;

  })(App.Views.ItemView);
  return List.Items = (function(superClass) {
    extend(Items, superClass);

    function Items() {
      return Items.__super__.constructor.apply(this, arguments);
    }

    Items.prototype.childView = List.Item;

    Items.prototype.tagName = "ul";

    Items.prototype.className = "playlist-items";

    return Items;

  })(App.Views.CollectionView);
});

this.Kodi.module("PlaylistApp.LocalParty", function(LocalParty, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getController: function() {
      return new LocalParty.Manager();
    }
  };
  LocalParty.Manager = (function(superClass) {
    extend(Manager, superClass);

    function Manager() {
      return Manager.__super__.constructor.apply(this, arguments);
    }

    Manager.prototype.initialize = function(options) {
      this.stateObj = App.request("state:local");
      return this.localPlaylist = App.request("command:local:controller", 'audio', 'PlayList');
    };

    Manager.prototype.fillGlasses = function(callback) {
      this.stateObj.setPlaying('partymode', true);
      return this.getSongs(10, (function(_this) {
        return function(collection) {
          return _this.localPlaylist.clear(function() {
            _this.localPlaylist.playCollection(collection);
            if (callback) {
              return callback(true);
            }
          });
        };
      })(this));
    };

    Manager.prototype.topUpGlasses = function() {
      return this.getSongs(1, (function(_this) {
        return function(collection) {
          return _this.localPlaylist.remove(0, function() {
            return _this.localPlaylist.addCollection(collection);
          });
        };
      })(this));
    };

    Manager.prototype.getSongs = function(limit, callback) {
      var options;
      options = {
        sort: {
          method: 'random',
          order: 'ascending'
        },
        limit: {
          start: 0,
          end: limit
        },
        cache: false,
        success: function(result) {
          return callback(result);
        }
      };
      return App.request("song:entities", options);
    };

    Manager.prototype.leaveParty = function(callback) {
      this.stateObj.setPlaying('partymode', false);
      if (callback) {
        return callback(true);
      }
    };

    Manager.prototype.isPartyMode = function() {
      return this.stateObj.getPlaying('partymode', false);
    };

    return Manager;

  })(App.Controllers.Base);
  App.commands.setHandler('playlist:local:partymode', function(op, callback) {
    var manager;
    if (op == null) {
      op = 'toggle';
    }
    manager = API.getController();
    if (op === 'toggle') {
      op = !manager.isPartyMode();
    }
    if (op === true) {
      manager.fillGlasses(callback);
    } else {
      manager.leaveParty(callback);
    }
    return App.vent.trigger("state:local:changed");
  });
  return App.vent.on("state:local:next", function() {
    var manager;
    manager = API.getController();
    if (manager.isPartyMode()) {
      return manager.topUpGlasses();
    }
  });
});

this.Kodi.module("PlaylistApp.M3u", function(M3u, App, Backbone, Marionette, $, _) {
  return M3u.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var List;
      List = this.getList(options.collection);
      return App.regionOffscreen.show(List);
    };

    Controller.prototype.getList = function(collection) {
      return new M3u.List({
        collection: collection
      });
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("PlaylistApp.M3u", function(M3u, App, Backbone, Marionette, $, _) {
  return M3u.List = (function(superClass) {
    extend(List, superClass);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.template = 'apps/playlist/m3u/list';

    List.prototype.tagName = "pre";

    List.prototype.className = "m3u-export";

    List.prototype.onRender = function() {
      var content, filename;
      content = this.$el.text();
      filename = $('.local-playlist-header h2').html() + ".m3u";
      return helpers.global.saveFileText(content, filename);
    };

    return List;

  })(App.Views.LayoutView);
});

this.Kodi.module("PlaylistApp", function(PlaylistApp, App, Backbone, Marionette, $, _) {
  var API;
  PlaylistApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "playlist": "list"
    };

    return Router;

  })(App.Router.Base);
  API = {
    list: function() {
      return new PlaylistApp.Show.Controller();
    },
    "export": function(collection) {
      return new PlaylistApp.M3u.Controller({
        collection: collection
      });
    },
    type: 'kodi',
    media: 'audio',
    setContext: function(type, media) {
      if (type == null) {
        type = 'kodi';
      }
      if (media == null) {
        media = 'audio';
      }
      this.type = type;
      return this.media = media;
    },
    getController: function() {
      return App.request("command:" + this.type + ":controller", this.media, 'PlayList');
    },
    getPlaylistItems: function() {
      return App.request("playlist:" + this.type + ":entities", this.media);
    }
  };
  App.reqres.setHandler("playlist:list", function(type, media) {
    API.setContext(type, media);
    return API.getPlaylistItems();
  });
  App.commands.setHandler("playlist:export", function(collection) {
    return API["export"](collection);
  });
  App.on("before:start", function() {
    return new PlaylistApp.Router({
      controller: API
    });
  });
  return App.addInitializer(function() {
    var controller;
    controller = new PlaylistApp.List.Controller();
    App.commands.setHandler("playlist:refresh", function(type, media) {
      return controller.renderList(type, media);
    });
    return App.vent.on("state:kodi:playing:updated", function(stateObj) {
      return controller.focusPlaying(stateObj.getState('player'), stateObj.getPlaying());
    });
  });
});

this.Kodi.module("PlaylistApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      this.landing = this.getLanding();
      return App.regionContent.show(this.landing);
    };

    Controller.prototype.getLanding = function() {
      return new Show.Landing();
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("PlaylistApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Landing = (function(superClass) {
    extend(Landing, superClass);

    function Landing() {
      return Landing.__super__.constructor.apply(this, arguments);
    }

    Landing.prototype.template = 'apps/playlist/show/landing';

    return Landing;

  })(App.Views.ItemView);
});

this.Kodi.module("PVR.ChannelList", function(List, App, Backbone, Marionette, $, _) {
  return List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var collection;
      collection = App.request("channel:entities", options.group);
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.renderChannels(collection);
            return _this.getSubNav();
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.Layout({
        collection: collection
      });
    };

    Controller.prototype.renderChannels = function(collection) {
      var view;
      view = new List.ChannelList({
        collection: collection
      });
      this.listenTo(view, 'childview:channel:play', function(parent, child) {
        var player;
        player = App.request("command:kodi:controller", 'auto', 'Player');
        return player.playEntity('channelid', child.model.get('id'), {}, (function(_this) {
          return function() {};
        })(this));
      });
      this.listenTo(view, 'childview:channel:record', function(parent, child) {
        var pvr;
        pvr = App.request("command:kodi:controller", 'auto', 'PVR');
        return pvr.setRecord(child.model.get('id'), {}, function() {
          return App.execute("notification:show", tr("Channel recording toggled"));
        });
      });
      return this.layout.regionContent.show(view);
    };

    Controller.prototype.getSubNav = function() {
      var subNav;
      subNav = App.request("navMain:children:show", 'pvr/tv', 'PVR');
      return this.layout.regionSidebarFirst.show(subNav);
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("PVR.ChannelList", function(List, App, Backbone, Marionette, $, _) {
  List.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.className = "pvr-page";

    return Layout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.ChannelTeaser = (function(superClass) {
    extend(ChannelTeaser, superClass);

    function ChannelTeaser() {
      return ChannelTeaser.__super__.constructor.apply(this, arguments);
    }

    ChannelTeaser.prototype.tagName = "li";

    ChannelTeaser.prototype.triggers = {
      "click .play": "channel:play",
      "click .record": "channel:record"
    };

    ChannelTeaser.prototype.initialize = function() {
      ChannelTeaser.__super__.initialize.apply(this, arguments);
      if (this.model != null) {
        return this.model.set({
          subtitle: this.model.get('broadcastnow').title
        });
      }
    };

    return ChannelTeaser;

  })(App.Views.CardView);
  return List.ChannelList = (function(superClass) {
    extend(ChannelList, superClass);

    function ChannelList() {
      return ChannelList.__super__.constructor.apply(this, arguments);
    }

    ChannelList.prototype.childView = List.ChannelTeaser;

    ChannelList.prototype.tagName = "ul";

    ChannelList.prototype.className = "card-grid--square";

    return ChannelList;

  })(App.Views.CollectionView);
});

this.Kodi.module("PVR", function(PVR, App, Backbone, Marionette, $, _) {
  var API;
  PVR.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "pvr/tv": "tv",
      "pvr/radio": "radio",
      "pvr/recordings": "recordings"
    };

    return Router;

  })(App.Router.Base);
  API = {
    tv: function() {
      return new PVR.ChannelList.Controller({
        group: 'alltv'
      });
    },
    radio: function() {
      return new PVR.ChannelList.Controller({
        group: 'allradio'
      });
    },
    recordings: function() {
      return new PVR.RecordingList.Controller();
    }
  };
  return App.on("before:start", function() {
    return new PVR.Router({
      controller: API
    });
  });
});

this.Kodi.module("PVR.RecordingList", function(List, App, Backbone, Marionette, $, _) {
  return List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var collection;
      collection = App.request("recording:entities", options.group);
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          collection.sortCollection('starttime', 'desc');
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.renderChannels(collection);
            return _this.getSubNav();
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(collection) {
      return new List.Layout({
        collection: collection
      });
    };

    Controller.prototype.renderChannels = function(collection) {
      var view;
      view = new List.RecordingList({
        collection: collection
      });
      this.listenTo(view, 'childview:recording:play', function(parent, child) {
        var playlist;
        if (child.model.get('player') === 'video') {
          return App.execute("input:resume", child.model, 'file');
        } else {
          playlist = App.request("command:kodi:controller", child.model.get('player'), 'PlayList');
          return playlist.play('file', child.model.get('file'));
        }
      });
      return this.layout.regionContent.show(view);
    };

    Controller.prototype.getSubNav = function() {
      var subNav;
      subNav = App.request("navMain:children:show", 'pvr/tv', 'PVR');
      return this.layout.regionSidebarFirst.show(subNav);
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("PVR.RecordingList", function(List, App, Backbone, Marionette, $, _) {
  List.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.className = "pvr-page";

    return Layout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.RecordingTeaser = (function(superClass) {
    extend(RecordingTeaser, superClass);

    function RecordingTeaser() {
      return RecordingTeaser.__super__.constructor.apply(this, arguments);
    }

    RecordingTeaser.prototype.template = 'apps/pvr/recordingList/recording';

    RecordingTeaser.prototype.tagName = "li";

    RecordingTeaser.prototype.className = 'pvr-card card';

    RecordingTeaser.prototype.triggers = {
      "click .play": "recording:play"
    };

    return RecordingTeaser;

  })(App.Views.ItemView);
  return List.RecordingList = (function(superClass) {
    extend(RecordingList, superClass);

    function RecordingList() {
      return RecordingList.__super__.constructor.apply(this, arguments);
    }

    RecordingList.prototype.childView = List.RecordingTeaser;

    RecordingList.prototype.tagName = "ul";

    RecordingList.prototype.className = "recordings";

    return RecordingList;

  })(App.Views.CollectionView);
});

this.Kodi.module("SearchApp.List", function(List, App, Backbone, Marionette, $, _) {
  return List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      this.updateProgress = bind(this.updateProgress, this);
      this.getLoader = bind(this.getLoader, this);
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.maxItemsCombinedSearch = 21;

    Controller.prototype.allEntities = ['movie', 'tvshow', 'artist', 'album', 'song', 'musicvideo'];

    Controller.prototype.searchFieldMap = {
      artist: 'artist',
      album: 'album',
      song: 'title',
      movie: 'title',
      tvshow: 'title',
      musicvideo: 'title'
    };

    Controller.prototype.entityTitles = {
      musicvideo: 'music video'
    };

    Controller.prototype.entityPreventSelect = ['tvshow'];

    Controller.prototype.initialize = function() {
      var media;
      this.pageLayout = this.getPageLayout();
      this.layout = this.getLayout();
      this.processed = [];
      this.processedItems = 0;
      this.addonSearches = App.request("addon:search:enabled");
      App.execute("selected:clear:items");
      media = this.getOption('media');
      if (media === 'all') {
        this.entities = this.allEntities;
      } else {
        this.entities = [media];
      }
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          var entity, len, n, ref, results1;
          _this.getLoader();
          ref = _this.entities;
          results1 = [];
          for (n = 0, len = ref.length; n < len; n++) {
            entity = ref[n];
            if (helpers.global.inArray(entity, _this.allEntities)) {
              results1.push(_this.getResultMedia(entity));
            } else {
              results1.push(_this.getResultAddon(entity));
            }
          }
          return results1;
        };
      })(this));
      this.listenTo(this.pageLayout, "show", (function(_this) {
        return function() {
          _this.pageLayout.regionContent.show(_this.layout);
          return _this.pageLayout.regionSidebarFirst.show(_this.getSidebar());
        };
      })(this));
      return App.regionContent.show(this.pageLayout);
    };

    Controller.prototype.getPageLayout = function() {
      return new List.PageLayout();
    };

    Controller.prototype.getLayout = function() {
      return new List.ListLayout();
    };

    Controller.prototype.getSidebar = function() {
      var len, media, medias, n, opts, ref;
      medias = [
        {
          id: 'all',
          title: 'all media'
        }
      ];
      ref = this.allEntities;
      for (n = 0, len = ref.length; n < len; n++) {
        media = ref[n];
        medias.push({
          id: media,
          title: this.getTitle(media) + 's'
        });
      }
      opts = {
        links: {
          media: medias,
          addon: this.addonSearches
        },
        query: this.getOption('query')
      };
      return new List.Sidebar(opts);
    };

    Controller.prototype.getLoader = function() {
      var addon, i, name, query, searchNames, text, toProcess;
      toProcess = _.difference(this.entities, this.processed);
      for (i in toProcess) {
        name = toProcess[i];
        addon = _.findWhere(this.addonSearches, {
          id: name
        });
        toProcess[parseInt(i)] = addon ? addon.title : name + 's';
      }
      searchNames = helpers.global.arrayToSentence(toProcess, false);
      query = helpers.global.arrayToSentence([this.getOption('query')], false);
      text = t.gettext('Searching for') + ' ' + query + ' ' + t.gettext('in') + ' ' + searchNames;
      return App.execute("loading:show:view", this.layout.loadingSet, text);
    };

    Controller.prototype.getResultMedia = function(entity) {
      var limit, opts, query;
      query = this.getOption('query');
      limit = {
        start: 0
      };
      if (this.getOption('media') === 'all') {
        limit.end = this.maxItemsCombinedSearch;
      }
      opts = {
        limits: limit,
        filter: {
          'operator': 'contains',
          'field': this.searchFieldMap[entity],
          'value': query
        },
        success: (function(_this) {
          return function(loaded) {
            var more, setView, view;
            if (loaded.length > 0) {
              _this.processedItems = _this.processedItems + loaded.length;
              more = false;
              if (loaded.length === _this.maxItemsCombinedSearch) {
                more = true;
                loaded.first(20);
              }
              view = App.request(entity + ":list:view", loaded, true);
              setView = new List.ListSet({
                entity: entity,
                more: more,
                query: query,
                title: _this.getTitle(entity) + 's',
                noMenuDefault: helpers.global.inArray(entity, _this.entityPreventSelect)
              });
              App.listenTo(setView, "show", function() {
                return setView.regionCollection.show(view);
              });
              _this.layout[entity + "Set"].show(setView);
            }
            return _this.updateProgress(entity);
          };
        })(this)
      };
      return App.request(entity + ":entities", opts);
    };

    Controller.prototype.getResultAddon = function(addonId) {
      var addonSearch, opts;
      addonSearch = _.findWhere(this.addonSearches, {
        id: addonId
      });
      opts = {
        file: addonSearch.url.replace('[QUERY]', this.getOption('query')),
        media: addonSearch.media,
        addonId: addonSearch.id,
        success: (function(_this) {
          return function(fullCollection) {
            var collection, filesView, i, len, n, ref, setView, type, typeCollection;
            i = 0;
            typeCollection = App.request("file:parsed:entities", fullCollection);
            ref = ['file', 'directory'];
            for (n = 0, len = ref.length; n < len; n++) {
              type = ref[n];
              collection = typeCollection[type];
              if (collection.length > 0) {
                i++;
                _this.processedItems = _this.processedItems + collection.length;
                filesView = App.request("browser:" + type + ":view", collection);
                setView = new List.ListSet({
                  entity: addonSearch.title,
                  title: i === 1 ? addonSearch.title : '',
                  more: false,
                  query: _this.getOption('query'),
                  noMenuDefault: true
                });
                App.listenTo(setView, "show", function() {
                  return setView.regionResult.show(filesView);
                });
                _this.layout.appendAddonView(addonId + type, setView);
              }
            }
            return _this.updateProgress(addonId);
          };
        })(this)
      };
      return App.request("file:entities", opts);
    };

    Controller.prototype.getTitle = function(entity) {
      var title;
      title = this.entityTitles[entity] ? this.entityTitles[entity] : entity;
      return title;
    };

    Controller.prototype.updateProgress = function(done) {
      if (done != null) {
        this.processed.push(done);
      }
      this.getLoader();
      if (this.processed.length === this.entities.length) {
        this.layout.loadingSet.$el.empty();
        if (this.processedItems === 0) {
          return this.pageLayout.regionContent.$el.html('<h2 class="search-no-result">' + tr('No results found') + '</h2>');
        }
      }
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("SearchApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.PageLayout = (function(superClass) {
    extend(PageLayout, superClass);

    function PageLayout() {
      return PageLayout.__super__.constructor.apply(this, arguments);
    }

    PageLayout.prototype.className = "search-page-layout";

    return PageLayout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.template = 'apps/search/list/search_layout';

    ListLayout.prototype.className = "search-page";

    ListLayout.prototype.regions = {
      artistSet: '.entity-set-artist',
      albumSet: '.entity-set-album',
      songSet: '.entity-set-song',
      movieSet: '.entity-set-movie',
      tvshowSet: '.entity-set-tvshow',
      musicvideoSet: '.entity-set-musicvideo',
      loadingSet: '.entity-set-loading'
    };

    ListLayout.prototype.appendAddonView = function(addonId, addonView) {
      var addonViewId;
      addonViewId = 'addonSet_' + addonId.split('.').join('_');
      $('.entity-set-addons', this.$el).append('<div id="' + addonViewId + '">');
      this.regionManager.addRegion(addonViewId, '#' + addonViewId);
      return this[addonViewId].show(addonView);
    };

    List.ListSet = (function(superClass1) {
      extend(ListSet, superClass1);

      function ListSet() {
        return ListSet.__super__.constructor.apply(this, arguments);
      }

      ListSet.prototype.className = "search-set landing-set";

      ListSet.prototype.initialize = function() {
        this.setOptions();
        return this.createModel();
      };

      ListSet.prototype.setOptions = function() {
        if (this.options.more && this.options.query) {
          return this.options.more = this.themeLink(t.gettext('Show more'), 'search/' + this.options.entity + '/' + this.options.query);
        }
      };

      return ListSet;

    })(App.Views.SetLayoutView);

    return ListLayout;

  })(App.Views.LayoutView);
  return List.Sidebar = (function(superClass) {
    extend(Sidebar, superClass);

    function Sidebar() {
      return Sidebar.__super__.constructor.apply(this, arguments);
    }

    Sidebar.prototype.template = 'apps/search/list/search_sidebar';

    Sidebar.prototype.className = "search-sidebar";

    Sidebar.prototype.onRender = function() {
      var $list, active, item, link, links, query, ref, results1, type;
      query = encodeURIComponent(this.options.query);
      ref = this.options.links;
      results1 = [];
      for (type in ref) {
        links = ref[type];
        if (links.length === 0) {
          results1.push($('.sidebar-section-' + type, this.$el).remove());
        } else {
          $list = $('.search-' + type + '-links', this.$el);
          results1.push((function() {
            var len, n, results2;
            results2 = [];
            for (n = 0, len = links.length; n < len; n++) {
              item = links[n];
              active = helpers.url.arg(1) === item.id ? 'active' : '';
              link = this.themeLink(t.gettext(item.title), 'search/' + item.id + '/' + query, {
                className: active
              });
              results2.push($list.append(this.themeTag('li', {}, link)));
            }
            return results2;
          }).call(this));
        }
      }
      return results1;
    };

    return Sidebar;

  })(App.Views.LayoutView);
});

this.Kodi.module("SearchApp", function(SearchApp, App, Backbone, Marionette, $, _) {
  var API;
  SearchApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "search": "view",
      "search/:media/:query": "list"
    };

    return Router;

  })(App.Router.Base);
  API = {
    keyUpTimeout: 2000,
    externalSearchUrls: {
      google: 'https://www.google.com/webhp?#q=[QUERY]',
      imdb: 'http://www.imdb.com/find?s=all&q=[QUERY]',
      tmdb: 'https://www.themoviedb.org/search?query=[QUERY]',
      tvdb: 'http://thetvdb.com/?searchseriesid=&tab=listseries&function=Search&string=[QUERY]',
      soundcloud: 'https://soundcloud.com/search?q=[QUERY]',
      youtube: 'https://www.youtube.com/results?search_query=[QUERY]'
    },
    list: function(media, query) {
      App.navigate("search/" + media + "/" + query);
      $('#search').val(query);
      return new SearchApp.List.Controller({
        query: query,
        media: media
      });
    },
    view: function() {
      return new SearchApp.Show.Controller();
    },
    searchBind: function() {
      return $('#search').on('keyup', function(e) {
        var media, val;
        $('#search-region').removeClass('pre-search');
        val = $('#search').val();
        media = helpers.url.arg(0) === 'search' ? helpers.url.arg(1) : 'all';
        clearTimeout(App.searchAllTimeout);
        if (e.which === 13) {
          return API.list(media, val);
        } else {
          $('#search-region').addClass('pre-search');
          return App.searchAllTimeout = setTimeout((function() {
            $('#search-region').removeClass('pre-search');
            return API.list(media, val);
          }), API.keyUpTimeout);
        }
      });
    }
  };
  App.commands.setHandler('search:go', function(type, query, provider) {
    var url;
    if (provider == null) {
      provider = 'all';
    }
    if (type === 'internal') {
      return App.navigate("search/" + provider + "/" + query, {
        trigger: true
      });
    } else if (API.externalSearchUrls[provider]) {
      url = API.externalSearchUrls[provider].replace('[QUERY]', encodeURIComponent(query));
      return window.open(url);
    }
  });
  App.on("before:start", function() {
    return new SearchApp.Router({
      controller: API
    });
  });
  return App.addInitializer(function() {
    return App.vent.on("shell:ready", function() {
      return API.searchBind();
    });
  });
});

this.Kodi.module("SearchApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      this.landing = this.getLanding();
      this.listenTo(this.landing, "show", (function(_this) {
        return function() {
          return $('#search').focus();
        };
      })(this));
      return App.regionContent.show(this.landing);
    };

    Controller.prototype.getLanding = function() {
      return new Show.Landing();
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("SearchApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  return Show.Landing = (function(superClass) {
    extend(Landing, superClass);

    function Landing() {
      return Landing.__super__.constructor.apply(this, arguments);
    }

    Landing.prototype.template = 'apps/search/show/landing';

    return Landing;

  })(App.Views.ItemView);
});

this.Kodi.module("Selected", function(Selected, App, Backbone, Marionette, $, _) {
  Selected.List = (function(superClass) {
    extend(List, superClass);

    function List() {
      return List.__super__.constructor.apply(this, arguments);
    }

    List.prototype.items = [];

    List.prototype.media = '';

    List.prototype.type = '';

    List.prototype.getItems = function() {
      return this.items;
    };

    List.prototype.getCollection = function(callback) {
      var collection, idProp, ids;
      if (helpers.global.inArray(this.type, ['song', 'artist', 'album'])) {
        ids = _.pluck(this.items, 'id');
        idProp = this.type + 'id';
        return App.request("song:custom:entities", idProp, ids, function(collection) {
          return callback(collection);
        });
      } else {
        collection = App.request(this.type + ":build:collection", this.items);
        return callback(collection);
      }
    };

    List.prototype.updateItems = function(op, model) {
      this.items = _.filter(this.items, function(item) {
        return item.uid !== model.uid;
      });
      if (op === 'add') {
        this.items.push(model);
        this.type = model.type;
        this.media = helpers.global.inArray(this.type, ['song', 'album', 'artist']) ? 'audio' : 'video';
      }
      this.updateUi();
      return this;
    };

    List.prototype.clearItems = function() {
      this.items = [];
      this.updateUi();
      return this;
    };

    List.prototype.setMedia = function(media) {
      this.media = media;
      return this;
    };

    List.prototype.getType = function() {
      return this.type;
    };

    List.prototype.getMedia = function() {
      return this.media;
    };

    List.prototype.updateUi = function() {
      var $selectedRegion, selectedText;
      selectedText = this.items.length + ' ' + t.ngettext("item selected", "items selected", this.items.length);
      $('#selected-count').text(selectedText);
      $selectedRegion = $('#selected-region');
      $selectedRegion.removeClassStartsWith('media-');
      $selectedRegion.addClass('media-' + this.media);
      if (this.items.length === 0) {
        $selectedRegion.hide();
        return $('.selected').removeClass('selected');
      } else {
        return $selectedRegion.show();
      }
    };

    return List;

  })(Marionette.Object);
  App.addInitializer(function() {
    return App.selected = new Selected.List;
  });
  App.reqres.setHandler("selected:get:items", function() {
    return App.selected.getItems();
  });
  App.reqres.setHandler("selected:get:media", function() {
    return App.selected.getMedia();
  });
  App.commands.setHandler("selected:update:items", function(op, model) {
    return App.selected.updateItems(op, model);
  });
  App.commands.setHandler("selected:clear:items", function() {
    return App.selected.clearItems();
  });
  App.commands.setHandler("selected:set:media", function(media) {
    return App.selected.setMedia(media);
  });
  App.commands.setHandler("selected:action:play", function() {
    return App.selected.getCollection(function(collection) {
      var kodiPlaylist;
      kodiPlaylist = App.request("command:kodi:controller", App.selected.getMedia(), 'PlayList');
      kodiPlaylist.playCollection(collection);
      return App.selected.clearItems();
    });
  });
  App.commands.setHandler("selected:action:add", function() {
    return App.selected.getCollection(function(collection) {
      var kodiPlaylist;
      kodiPlaylist = App.request("command:kodi:controller", App.selected.getMedia(), 'PlayList');
      kodiPlaylist.addCollection(collection);
      return App.selected.clearItems();
    });
  });
  return App.commands.setHandler("selected:action:localadd", function() {
    var idProp, ids, items;
    items = App.selected.getItems();
    ids = _.pluck(items, 'id');
    idProp = App.selected.getType() + 'id';
    App.execute("localplaylist:addentity", idProp, ids);
    return App.selected.clearItems();
  });
});

this.Kodi.module("SettingsApp", function(SettingsApp, App, Backbone, Marionette, $, _) {
  var API;
  SettingsApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "settings/web": "local",
      "settings/kodi": "kodi",
      "settings/kodi/:section": "kodi",
      "settings/addons": "addons",
      "settings/nav": "navMain",
      "settings/search": "search"
    };

    return Router;

  })(App.Router.Base);
  API = {
    subNavId: 'settings/web',
    local: function() {
      return new SettingsApp.Show.Local.Controller();
    },
    addons: function() {
      return new SettingsApp.Show.Addons.Controller();
    },
    navMain: function() {
      return new SettingsApp.Show.navMain.Controller();
    },
    search: function() {
      return new SettingsApp.Show.Search.Controller();
    },
    kodi: function(section, category) {
      return new SettingsApp.Show.Kodi.Controller({
        section: section,
        category: category
      });
    },
    getSubNav: function() {
      var collection, sidebarView;
      collection = App.request("settings:kodi:entities", {
        type: 'sections'
      });
      sidebarView = new SettingsApp.Show.Sidebar();
      App.listenTo(sidebarView, "show", (function(_this) {
        return function() {
          var settingsNavView;
          App.execute("when:entity:fetched", collection, function() {
            var kodiSettingsView;
            kodiSettingsView = App.request("navMain:collection:show", collection, t.gettext('Kodi settings'));
            return sidebarView.regionKodiNav.show(kodiSettingsView);
          });
          settingsNavView = App.request("navMain:children:show", API.subNavId, 'General');
          return sidebarView.regionLocalNav.show(settingsNavView);
        };
      })(this));
      return sidebarView;
    }
  };
  App.on("before:start", function() {
    return new SettingsApp.Router({
      controller: API
    });
  });
  return App.reqres.setHandler('settings:subnav', function() {
    return API.getSubNav();
  });
});

this.Kodi.module("SettingsApp.Show.Base", function(SettingsBase, App, Backbone, Marionette, $, _) {
  return SettingsBase.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      this.layout = this.getLayoutView();
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          _this.getSubNav();
          return _this.getForm();
        };
      })(this));
      return App.regionContent.show(this.layout);
    };

    Controller.prototype.getLayoutView = function() {
      return new App.SettingsApp.Show.Layout();
    };

    Controller.prototype.getSubNav = function() {
      var subNav;
      subNav = App.request('settings:subnav');
      return this.layout.regionSidebarFirst.show(subNav);
    };

    Controller.prototype.getForm = function() {
      return this.getCollection((function(_this) {
        return function(collection) {
          var form, options;
          options = {
            form: _this.getStructure(collection),
            formState: [],
            config: {
              attributes: {
                "class": 'settings-form'
              },
              callback: function(formState, formView) {
                return _this.saveCallback(formState, formView);
              },
              onShow: function() {
                return _this.onReady();
              }
            }
          };
          form = App.request("form:wrapper", options);
          return _this.layout.regionContent.show(form);
        };
      })(this));
    };

    Controller.prototype.getCollection = function(callback) {
      var res;
      res = {};
      return callback(res);
    };

    Controller.prototype.getStructure = function(collection) {
      return [];
    };

    Controller.prototype.saveCallback = function(formState, formView) {};

    Controller.prototype.onReady = function() {
      return this.layout;
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("SettingsApp.Show.Addons", function(Addons, App, Backbone, Marionette, $, _) {
  return Addons.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      this.layout = this.getLayoutView();
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          _this.getSubNav();
          return _this.getForm();
        };
      })(this));
      return App.regionContent.show(this.layout);
    };

    Controller.prototype.getLayoutView = function() {
      return new App.SettingsApp.Show.Layout();
    };

    Controller.prototype.getSubNav = function() {
      var subNav;
      subNav = App.request('settings:subnav');
      return this.layout.regionSidebarFirst.show(subNav);
    };

    Controller.prototype.addonController = function() {
      return App.request("command:kodi:controller", 'auto', 'AddOn');
    };

    Controller.prototype.getAllAddons = function(callback) {
      return this.addonController().getAllAddons(callback);
    };

    Controller.prototype.getForm = function() {
      return this.getAllAddons((function(_this) {
        return function(addons) {
          var form, options;
          options = {
            form: _this.getStructure(addons),
            formState: [],
            config: {
              attributes: {
                "class": 'settings-form'
              },
              callback: function(data, formView) {
                return _this.saveCallback(data, formView);
              }
            }
          };
          form = App.request("form:wrapper", options);
          return _this.layout.regionContent.show(form);
        };
      })(this));
    };

    Controller.prototype.getStructure = function(addons) {
      var addon, el, elements, enabled, form, i, type, types;
      form = [];
      types = [];
      for (i in addons) {
        addon = addons[i];
        types[addon.type] = true;
      }
      for (type in types) {
        enabled = types[type];
        elements = _.where(addons, {
          type: type
        });
        for (i in elements) {
          el = elements[i];
          elements[i] = $.extend(el, {
            id: el.addonid,
            name: el.addonid,
            type: 'checkbox',
            defaultValue: el.enabled,
            title: el.name
          });
        }
        form.push({
          title: type,
          id: type,
          children: elements
        });
      }
      return form;
    };

    Controller.prototype.saveCallback = function(data, formView) {
      var updating;
      updating = [];
      return this.getAllAddons(function(addons) {
        var addon, addonid, commander, commands, key, val;
        for (key in addons) {
          addon = addons[key];
          addonid = addon.addonid;
          if (addon.enabled === !data[addonid]) {
            updating[addonid] = data[addonid];
          }
        }
        commander = App.request("command:kodi:controller", 'auto', 'Commander');
        commands = [];
        for (key in updating) {
          val = updating[key];
          commands.push({
            method: 'Addons.SetAddonEnabled',
            params: [key, val]
          });
        }
        return commander.multipleCommands(commands, (function(_this) {
          return function(resp) {
            return Kodi.execute("notification:show", 'Toggled ' + commands.length + ' addons');
          };
        })(this));
      });
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("SettingsApp.Show.Kodi", function(Kodi, App, Backbone, Marionette, $, _) {
  return Kodi.Controller = (function(superClass) {
    var API;

    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    API = {
      optionLookups: {
        'lookandfeel.skin': 'xbmc.gui.skin',
        'locale.language': 'kodi.resource.language',
        'screensaver.mode': 'xbmc.ui.screensaver',
        'musiclibrary.albumsscraper': 'xbmc.metadata.scraper.albums',
        'musiclibrary.artistsscraper': 'xbmc.metadata.scraper.artists',
        'musicplayer.visualisation': 'xbmc.player.musicviz',
        'services.webskin': 'xbmc.webinterface',
        'subtitles.tv': 'xbmc.subtitle.module',
        'subtitles.movie': 'xbmc.subtitle.module',
        'audiocds.encoder': 'xbmc.audioencoder'
      },
      actionLookups: {
        "musiclibrary.cleanup": "command:kodi:audio:clean",
        "videolibrary.cleanup": "command:kodi:video:clean"
      },
      parseOptions: function(options) {
        var out;
        out = {};
        $(options).each(function(i, option) {
          return out[option.value] = option.label;
        });
        return out;
      },
      labelRewrites: function(item) {
        if (item.id.lastIndexOf('videolibrary', 0) === 0) {
          item.title += ' (video)';
        }
        if (item.id.lastIndexOf('musiclibrary', 0) === 0) {
          item.title += ' (music)';
        }
        return item;
      }
    };

    Controller.prototype.initialize = function(options) {
      this.layout = this.getLayoutView();
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          _this.getSubNav();
          if (options.section) {
            return _this.getSettingsForm(options.section);
          }
        };
      })(this));
      return App.regionContent.show(this.layout);
    };

    Controller.prototype.getLayoutView = function() {
      return new App.SettingsApp.Show.Layout();
    };

    Controller.prototype.getSubNav = function() {
      var subNav;
      subNav = App.request('settings:subnav');
      return this.layout.regionSidebarFirst.show(subNav);
    };

    Controller.prototype.getSettingsForm = function(section) {
      var categoryCollection, formStructure;
      formStructure = [];
      categoryCollection = App.request("settings:kodi:entities", {
        type: 'categories',
        section: section
      });
      return App.execute("when:entity:fetched", categoryCollection, (function(_this) {
        return function() {
          var categories, categoryNames;
          categoryNames = categoryCollection.pluck("id");
          categories = categoryCollection.toJSON();
          return App.request("settings:kodi:filtered:entities", {
            type: 'settings',
            section: section,
            categories: categoryNames,
            callback: function(categorySettings) {
              $(categories).each(function(i, category) {
                var items;
                items = _this.mapSettingsToElements(categorySettings[category.id]);
                if (items.length > 0) {
                  return formStructure.push({
                    title: category.title,
                    id: category.id,
                    children: items
                  });
                }
              });
              return _this.getForm(section, formStructure);
            }
          });
        };
      })(this));
    };

    Controller.prototype.getForm = function(section, formStructure) {
      var form, options;
      options = {
        form: formStructure,
        config: {
          attributes: {
            "class": 'settings-form'
          },
          callback: (function(_this) {
            return function(data, formView) {
              return _this.saveCallback(data, formView);
            };
          })(this)
        }
      };
      form = App.request("form:wrapper", options);
      return this.layout.regionContent.show(form);
    };

    Controller.prototype.getAddonOptions = function(elId, value) {
      var addon, addons, filteredAddons, i, lookup, mappedType, options;
      mappedType = API.optionLookups[elId];
      options = [];
      lookup = {};
      if (mappedType) {
        addons = App.request('addon:enabled:addons');
        filteredAddons = _.where(addons, {
          type: mappedType
        });
        for (i in filteredAddons) {
          addon = filteredAddons[i];
          options.push({
            value: addon.addonid,
            label: addon.name
          });
          lookup[addon.addonid] = true;
        }
        if (!lookup[value]) {
          options.push({
            value: value,
            label: value
          });
        }
        return options;
      }
      return false;
    };

    Controller.prototype.mapSettingsToElements = function(items) {
      var elements;
      elements = [];
      $(items).each((function(_this) {
        return function(i, item) {
          var options, type;
          type = null;
          switch (item.type) {
            case 'boolean':
              type = 'checkbox';
              break;
            case 'path':
              type = 'textfield';
              break;
            case 'addon':
              options = _this.getAddonOptions(item.id, item.value);
              if (options) {
                item.options = options;
              } else {
                type = 'textfield';
              }
              break;
            case 'integer':
              type = 'textfield';
              break;
            case 'string':
              type = 'textfield';
              break;
            case 'action':
              if (API.actionLookups[item.id]) {
                type = 'button';
                item.value = item.label;
                item.trigger = API.actionLookups[item.id];
              } else {
                type = 'hide';
              }
              break;
            default:
              type = 'hide';
          }
          if (item.options) {
            type = 'select';
            item.options = API.parseOptions(item.options);
          }
          item = API.labelRewrites(item);
          if (type === 'hide') {
            return console.log('no setting to field mapping for: ' + item.type + ' -> ' + item.id);
          } else {
            item.type = type;
            item.defaultValue = item.value;
            return elements.push(item);
          }
        };
      })(this));
      return elements;
    };

    Controller.prototype.saveCallback = function(data, formView) {
      return App.execute("settings:kodi:save:entities", data, (function(_this) {
        return function(resp) {
          App.execute("notification:show", t.gettext("Saved Kodi settings"));
          App.vent.trigger("config:local:updated", {});
          return App.vent.trigger("config:kodi:updated", data);
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("SettingsApp.Show.Kodi", function(Kodi, App, Backbone, Marionette, $, _) {});

this.Kodi.module("SettingsApp.Show.Local", function(Local, App, Backbone, Marionette, $, _) {
  return Local.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      this.layout = this.getLayoutView();
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          _this.getSubNav();
          return _this.getForm();
        };
      })(this));
      return App.regionContent.show(this.layout);
    };

    Controller.prototype.getLayoutView = function() {
      return new App.SettingsApp.Show.Layout();
    };

    Controller.prototype.getSubNav = function() {
      var subNav;
      subNav = App.request('settings:subnav');
      return this.layout.regionSidebarFirst.show(subNav);
    };

    Controller.prototype.getForm = function() {
      var form, options;
      options = {
        form: this.getStructure(),
        formState: this.getState(),
        config: {
          attributes: {
            "class": 'settings-form'
          },
          callback: (function(_this) {
            return function(data, formView) {
              return _this.saveCallback(data, formView);
            };
          })(this)
        }
      };
      form = App.request("form:wrapper", options);
      return this.layout.regionContent.show(form);
    };

    Controller.prototype.getStructure = function() {
      return [
        {
          title: 'General options',
          id: 'general',
          children: [
            {
              id: 'lang',
              title: tr("Language"),
              type: 'select',
              options: helpers.translate.getLanguages(),
              defaultValue: 'en',
              description: tr('Preferred language, need to refresh browser to take effect')
            }, {
              id: 'defaultPlayer',
              title: tr("Default player"),
              type: 'select',
              options: {
                auto: 'Auto',
                kodi: 'Kodi',
                local: 'Local'
              },
              defaultValue: 'auto',
              description: tr('Which player to start with')
            }, {
              id: 'keyboardControl',
              title: tr("Keyboard controls"),
              type: 'select',
              options: {
                kodi: 'Kodi',
                local: 'Browser',
                both: 'Both'
              },
              defaultValue: 'kodi',
              description: tr('In Chorus, will you keyboard control Kodi, the browser or both') + '. <a href="#help/keybind-readme">' + tr('Learn more') + '</a>'
            }
          ]
        }, {
          title: 'List options',
          id: 'list',
          children: [
            {
              id: 'ignoreArticle',
              title: tr("Ignore article"),
              type: 'checkbox',
              defaultValue: true,
              description: tr("Ignore articles (terms such as 'The' and 'A') when sorting lists")
            }, {
              id: 'albumArtistsOnly',
              title: tr("Album artists only"),
              type: 'checkbox',
              defaultValue: true,
              description: tr('When listing artists should we only see artists with albums or all artists found. Warning: turning this off can impact performance with large libraries')
            }, {
              id: 'playlistFocusPlaying',
              title: tr("Focus playlist on playing"),
              type: 'checkbox',
              defaultValue: true,
              description: tr('Automatically scroll the playlist to the current playing item. This happens whenever the playing item is changed')
            }
          ]
        }, {
          title: 'Appearance',
          id: 'appearance',
          children: [
            {
              id: 'vibrantHeaders',
              title: tr("Vibrant headers"),
              type: 'checkbox',
              defaultValue: true,
              description: tr("Use colourful headers for media pages")
            }, {
              id: 'disableThumbs',
              title: tr("Disable Thumbs Up"),
              type: 'checkbox',
              defaultValue: false,
              description: t.sprintf(tr("Remove the thumbs up button from media. Note: you may also want to remove the menu item from the %1$s"), '<a href="#settings/nav">' + tr('Main Nav') + '</a>')
            }, {
              id: 'showDeviceName',
              title: tr("Show device name"),
              type: 'checkbox',
              defaultValue: false,
              description: tr("Show the Kodi device name in the header of Chorus")
            }
          ]
        }, {
          title: 'Advanced options',
          id: 'advanced',
          children: [
            {
              id: 'socketsPort',
              title: tr("Websockets port"),
              type: 'textfield',
              defaultValue: '9090',
              description: "9090 " + tr("is the default")
            }, {
              id: 'socketsHost',
              title: tr("Websockets host"),
              type: 'textfield',
              defaultValue: 'auto',
              description: tr("The hostname used for websockets connection. Set to 'auto' to use the current hostname.")
            }, {
              id: 'pollInterval',
              title: tr("Poll interval"),
              type: 'select',
              defaultValue: '10000',
              options: {
                '5000': "5 " + tr('sec'),
                '10000': "10 " + tr('sec'),
                '30000': "30 " + tr('sec'),
                '60000': "60 " + tr('sec')
              },
              description: tr("How often do I poll for updates from Kodi (Only applies when websockets inactive)")
            }, {
              id: 'kodiSettingsLevel',
              title: tr("Kodi settings level"),
              type: 'select',
              defaultValue: 'standard',
              options: {
                'standard': 'Standard',
                'advanced': 'Advanced',
                'expert': 'Expert'
              },
              description: tr('Advanced setting level is recommended for those who know what they are doing.')
            }, {
              id: 'reverseProxy',
              title: tr("Reverse proxy support"),
              type: 'checkbox',
              defaultValue: false,
              description: tr('Enable support for reverse proxying.')
            }, {
              id: 'refreshIgnoreNFO',
              title: tr("Refresh Ignore NFO"),
              type: 'checkbox',
              defaultValue: true,
              description: tr('Ignore local NFO files when manually refreshing media.')
            }
          ]
        }, {
          title: 'API Keys',
          id: 'apikeys',
          children: [
            {
              id: 'apiKeyTMDB',
              title: tr("The Movie DB"),
              type: 'textfield',
              defaultValue: '',
              description: tr("Set your personal API key")
            }, {
              id: 'apiKeyFanartTv',
              title: tr("FanartTV"),
              type: 'textfield',
              defaultValue: '',
              description: tr("Set your personal API key")
            }, {
              id: 'apiKeyYouTube',
              title: tr("YouTube"),
              type: 'textfield',
              defaultValue: '',
              description: tr("Set your personal API key")
            }
          ]
        }
      ];
    };

    Controller.prototype.getState = function() {
      return config.get('app', 'config:local', config["static"]);
    };

    Controller.prototype.saveCallback = function(data, formView) {
      config.set('app', 'config:local', data);
      config["static"] = _.extend(config["static"], config.get('app', 'config:local', config["static"]));
      Kodi.vent.trigger("config:local:updated", config["static"]);
      return Kodi.execute("notification:show", tr("Web Settings saved."));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("SettingsApp.Show.navMain", function(NavMain, App, Backbone, Marionette, $, _) {
  return NavMain.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      this.onReady = bind(this.onReady, this);
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.getCollection = function(callback) {
      var collection;
      collection = App.request('navMain:entities');
      return $.getJSON('lib/icons/mdi.json', function(iconList) {
        return callback({
          collection: collection,
          icons: iconList
        });
      });
    };

    Controller.prototype.getStructure = function(data) {
      var defaults, form, i, iconLink, item, ref, row;
      this.data = data;
      defaults = ' <a class="nav-restore-defaults">' + t.gettext('Click here restore defaults') + '</a>';
      iconLink = '<a href="#lab/icon-browser">icons</a>';
      form = [
        {
          title: t.gettext('Main Menu Structure'),
          id: 'intro',
          children: [
            {
              id: 'intro-text',
              type: 'markup',
              markup: t.sprintf(tr('Here you can change the title, url and %1$s for menu items. You can also remove, re-order and add new items.'), iconLink) + defaults
            }
          ]
        }
      ];
      ref = data.collection.getRawCollection();
      for (i in ref) {
        item = ref[i];
        item.weight = i;
        row = this.getRow(item, data.icons);
        form.push(row);
      }
      form.push({
        id: 'add-another',
        "class": 'add-another-wrapper',
        children: [
          {
            type: 'button',
            value: 'Add another',
            id: 'add-another'
          }
        ]
      });
      return form;
    };

    Controller.prototype.saveCallback = function(formState, formView) {
      var i, item, items, ref;
      items = [];
      ref = formState.title;
      for (i in ref) {
        item = ref[i];
        items.push({
          title: formState.title[i],
          path: formState.path[i],
          icon: formState.icon[i],
          weight: formState.weight[i],
          id: formState.id[i],
          parent: 0
        });
      }
      App.request("navMain:update:entities", items);
      App.vent.trigger("navMain:refresh");
      return Kodi.execute("notification:show", t.gettext('Menu updated'));
    };

    Controller.prototype.onReady = function() {
      var $ctx, self;
      self = this;
      $ctx = this.layout.regionContent.$el;
      $('.settings-form').addClass('settings-form-draggable');
      this.binds();
      $('#form-edit-add-another', $ctx).click(function(e) {
        var blank, formView, row;
        e.preventDefault();
        blank = {
          weight: $(".nav-item-row").length + 1,
          title: '',
          path: '',
          icon: 'mdi-action-extension'
        };
        row = self.getRow(blank);
        formView = App.request("form:render:items", [row]);
        $(this).closest('.add-another-wrapper').before(formView.render().$el);
        return self.binds();
      });
      if ($(window).width() > config.getLocal('largeBreakpoint')) {
        $('.form-groups', $ctx).sortable({
          draggable: ".draggable-row",
          onEnd: function(e) {
            return $('input[id^="form-edit-weight-"]', e.target).each(function(i, d) {
              return $(d).attr('value', i);
            });
          }
        });
      }
      return $('.nav-restore-defaults', $ctx).on("click", (function(_this) {
        return function(e) {
          e.preventDefault();
          App.request("navMain:update:defaults");
          _this.initialize();
          return App.vent.trigger("navMain:refresh");
        };
      })(this));
    };

    Controller.prototype.binds = function() {
      var $ctx;
      $ctx = $('.settings-form');
      $('select[id^="form-edit-icon"]', $ctx).once('icon-changer').on("change", function(e) {
        return $(this).closest('.group-parent', $ctx).find('i').first().attr('class', $(this).val());
      });
      $('.remove-item', $ctx).on("click", function(e) {
        return $(this).closest('.group-parent', $ctx).remove();
      });
      return $.material.init();
    };

    Controller.prototype.getRow = function(item) {
      var i, icon, icons;
      icons = this.data.icons;
      i = item.weight;
      icon = '<i class="' + item.icon + '"></i>';
      return {
        id: 'item-' + item.weight,
        "class": 'nav-item-row draggable-row',
        children: [
          {
            id: 'title-' + i,
            name: 'title[]',
            type: 'textfield',
            title: 'Title',
            defaultValue: item.title
          }, {
            id: 'path-' + i,
            name: 'path[]',
            type: 'textfield',
            title: 'Url',
            defaultValue: item.path
          }, {
            id: 'icon-' + i,
            name: 'icon[]',
            type: 'select',
            titleHtml: 'Icon' + icon,
            defaultValue: item.icon,
            options: icons
          }, {
            id: 'weight-' + i,
            name: 'weight[]',
            type: 'hidden',
            title: '',
            defaultValue: i
          }, {
            id: 'id-' + i,
            name: 'id[]',
            type: 'hidden',
            title: '',
            defaultValue: 1000 + i
          }, {
            id: 'remove-' + i,
            type: 'markup',
            markup: '<span class="remove-item">&times;</span>'
          }
        ]
      };
    };

    return Controller;

  })(App.SettingsApp.Show.Base.Controller);
});

this.Kodi.module("SettingsApp.Show.Search", function(Search, App, Backbone, Marionette, $, _) {
  return Search.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      this.onReady = bind(this.onReady, this);
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.getCollection = function(callback) {
      this.collection = App.request('searchAddons:entities');
      return callback(this.collection);
    };

    Controller.prototype.getStructure = function(data) {
      var form, i, item, items, row;
      this.data = data;
      form = [
        {
          title: t.gettext('Custom Add-on search'),
          id: 'intro',
          children: [
            {
              id: 'intro-text',
              type: 'markup',
              markup: t.sprintf(tr("Add custom add-on searches"), '<a href="#help/addons">' + tr('Add-ons help page') + '</a>')
            }
          ]
        }
      ];
      items = this.collection.toJSON();
      if (items.length === 0) {
        items.push(this.getBlank(items.length));
      }
      for (i in items) {
        item = items[i];
        item.weight = i;
        row = this.getRow(item);
        form.push(row);
      }
      form.push({
        id: 'add-another',
        "class": 'add-another-wrapper',
        children: [
          {
            type: 'button',
            value: 'Add another',
            id: 'add-another'
          }
        ]
      });
      return form;
    };

    Controller.prototype.saveCallback = function(formState, formView) {
      var i, item, items, ref;
      items = [];
      ref = formState.title;
      for (i in ref) {
        item = ref[i];
        items.push({
          title: formState.title[i],
          url: formState.url[i],
          media: formState.media[i],
          weight: formState.weight[i],
          id: formState.id[i]
        });
      }
      App.request("searchAddons:update:entities", items);
      return Kodi.execute("notification:show", t.gettext('Custom Addon search updated'));
    };

    Controller.prototype.onReady = function() {
      var $ctx, self;
      self = this;
      $ctx = this.layout.regionContent.$el;
      $('.settings-form').addClass('settings-form-draggable');
      this.binds();
      if ($(window).width() > config.getLocal('largeBreakpoint')) {
        $('.form-groups', $ctx).sortable({
          draggable: ".draggable-row",
          onEnd: function(e) {
            return $('input[id^="form-edit-weight-"]', e.target).each(function(i, d) {
              return $(d).attr('value', i);
            });
          }
        });
      }
      $('#form-edit-add-another', $ctx).click(function(e) {
        var blank, formView, row;
        e.preventDefault();
        blank = self.getBlank($(".item-row").length);
        row = self.getRow(blank);
        formView = App.request("form:render:items", [row]);
        $(this).closest('.add-another-wrapper').before(formView.render().$el);
        return self.binds();
      });
      return $('.restore-defaults', $ctx).on("click", (function(_this) {
        return function(e) {};
      })(this));
    };

    Controller.prototype.getBlank = function(weight) {
      return {
        weight: weight,
        title: '',
        url: '',
        media: 'music'
      };
    };

    Controller.prototype.binds = function() {
      var $ctx;
      $ctx = $('.settings-form');
      $('.remove-item', $ctx).on("click", function(e) {
        return $(this).closest('.group-parent', $ctx).remove();
      });
      return $.material.init();
    };

    Controller.prototype.getRow = function(item) {
      var i;
      i = item.weight;
      return {
        id: 'item-' + item.weight,
        "class": 'item-row draggable-row',
        children: [
          {
            id: 'title-' + i,
            name: 'title[]',
            type: 'textfield',
            title: 'Title',
            defaultValue: item.title
          }, {
            id: 'url-' + i,
            name: 'url[]',
            type: 'textfield',
            title: 'Url',
            defaultValue: item.url
          }, {
            id: 'media-' + i,
            name: 'media[]',
            type: 'select',
            title: 'Media',
            defaultValue: item.media,
            options: {
              music: 'Music',
              video: 'Video'
            }
          }, {
            id: 'weight-' + i,
            name: 'weight[]',
            type: 'hidden',
            title: '',
            defaultValue: i
          }, {
            id: 'id-' + i,
            name: 'id[]',
            type: 'hidden',
            title: '',
            defaultValue: 'custom.addon.' + i
          }, {
            id: 'remove-' + i,
            type: 'markup',
            markup: '<span class="remove-item">&times;</span>'
          }
        ]
      };
    };

    return Controller;

  })(App.SettingsApp.Show.Base.Controller);
});

this.Kodi.module("SettingsApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  Show.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.className = "settings-page";

    return Layout;

  })(App.Views.LayoutWithSidebarFirstView);
  return Show.Sidebar = (function(superClass) {
    extend(Sidebar, superClass);

    function Sidebar() {
      return Sidebar.__super__.constructor.apply(this, arguments);
    }

    Sidebar.prototype.className = "settings-sidebar";

    Sidebar.prototype.template = "apps/settings/show/settings_sidebar";

    Sidebar.prototype.tagName = "div";

    Sidebar.prototype.regions = {
      regionKodiNav: '.kodi-nav',
      regionLocalNav: '.local-nav'
    };

    return Sidebar;

  })(App.Views.LayoutView);
});

this.Kodi.module("Shell", function(Shell, App, Backbone, Marionette, $, _) {
  var API;
  Shell.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "": "homePage",
      "home": "homePage"
    };

    return Router;

  })(App.Router.Base);
  API = {
    homePage: function() {
      var home;
      home = new Shell.HomepageLayout();
      App.regionContent.show(home);
      this.setFanart();
      App.vent.on("state:changed", (function(_this) {
        return function(state) {
          var stateObj;
          stateObj = App.request("state:current");
          if (stateObj.isPlayingItemChanged() && helpers.url.arg(0) === '') {
            return _this.setFanart();
          }
        };
      })(this));
      return App.listenTo(home, "destroy", (function(_this) {
        return function() {
          return App.execute("images:fanart:set", 'none');
        };
      })(this));
    },
    setFanart: function() {
      var playingItem, stateObj;
      stateObj = App.request("state:current");
      if (stateObj != null) {
        playingItem = stateObj.getPlaying('item');
        return App.execute("images:fanart:set", playingItem.fanart);
      } else {
        return App.execute("images:fanart:set");
      }
    },
    renderLayout: function() {
      var playlistState, shellLayout;
      shellLayout = new Shell.Layout();
      App.root.show(shellLayout);
      App.addRegions(shellLayout.regions);
      App.execute("loading:show:page");
      this.setAppTitle();
      playlistState = config.get('app', 'shell:playlist:state', 'open');
      if (playlistState === 'closed') {
        this.alterRegionClasses('add', "shell-playlist-closed");
      }
      this.configUpdated();
      App.vent.on("config:local:updated", (function(_this) {
        return function(data) {
          return _this.configUpdated();
        };
      })(this));
      App.vent.on("filter:filtering:start", (function(_this) {
        return function() {
          return _this.alterRegionClasses('add', "filters-loading");
        };
      })(this));
      App.vent.on("filter:filtering:stop", (function(_this) {
        return function() {
          return _this.alterRegionClasses('remove', "filters-loading");
        };
      })(this));
      App.listenTo(shellLayout, "shell:playlist:toggle", (function(_this) {
        return function(child, args) {
          var state;
          playlistState = config.get('app', 'shell:playlist:state', 'open');
          state = playlistState === 'open' ? 'closed' : 'open';
          config.set('app', 'shell:playlist:state', state);
          return _this.alterRegionClasses('toggle', "shell-playlist-closed");
        };
      })(this));
      App.listenTo(shellLayout, "shell:reconnect", (function(_this) {
        return function() {
          return App.execute('shell:reconnect');
        };
      })(this));
      this.bindListenersContextMenu(shellLayout);
      return this.bindListenersSelectedMenu(shellLayout);
    },
    alterRegionClasses: function(op, classes, region) {
      var $body, action;
      if (region == null) {
        region = 'root';
      }
      $body = App.getRegion(region).$el;
      action = op + "Class";
      return $body[action](classes);
    },
    configUpdated: function() {
      var disableThumbs, disableThumbsClassOp;
      disableThumbs = config.getLocal('disableThumbs', false);
      disableThumbsClassOp = disableThumbs === true ? 'add' : 'remove';
      this.alterRegionClasses(disableThumbsClassOp, 'disable-thumbs');
      return this.setAppTitle();
    },
    setAppTitle: function() {
      var settingsController;
      App.getRegion('regionTitle').$el.text('');
      if (config.getLocal('showDeviceName', false) === true) {
        settingsController = App.request("command:kodi:controller", 'auto', 'Settings');
        return settingsController.getSettingValue('services.devicename', function(title) {
          return App.getRegion('regionTitle').$el.text(title);
        });
      }
    },
    bindListenersContextMenu: function(shellLayout) {
      App.listenTo(shellLayout, "shell:audio:scan", function() {
        return App.request("command:kodi:controller", 'auto', 'AudioLibrary').scan();
      });
      App.listenTo(shellLayout, "shell:video:scan", function() {
        return App.request("command:kodi:controller", 'auto', 'VideoLibrary').scan();
      });
      App.listenTo(shellLayout, "shell:goto:lab", function() {
        return App.navigate("#lab", {
          trigger: true
        });
      });
      App.listenTo(shellLayout, "shell:about", function() {
        return App.navigate("#help", {
          trigger: true
        });
      });
      return App.listenTo(shellLayout, "shell:send:input", function() {
        return App.execute("input:textbox", '');
      });
    },
    bindListenersSelectedMenu: function(shellLayout) {
      App.listenTo(shellLayout, "shell:selected:play", function() {
        return App.execute("selected:action:play");
      });
      App.listenTo(shellLayout, "shell:selected:add", function() {
        return App.execute("selected:action:add");
      });
      return App.listenTo(shellLayout, "shell:selected:localadd", function() {
        return App.execute("selected:action:localadd");
      });
    }
  };
  App.addInitializer(function() {
    return App.commands.setHandler("shell:view:ready", function() {
      API.renderLayout();
      new Shell.Router({
        controller: API
      });
      App.vent.trigger("shell:ready");
      return App.commands.setHandler("body:state", function(op, state) {
        return API.alterRegionClasses(op, state);
      });
    });
  });
  App.commands.setHandler('shell:reconnect', function() {
    API.alterRegionClasses('add', 'reconnecting');
    return helpers.connection.reconnect(function() {
      API.alterRegionClasses('remove', 'lost-connection');
      return API.alterRegionClasses('remove', 'reconnecting');
    });
  });
  return App.commands.setHandler('shell:disconnect', function() {
    API.alterRegionClasses('add', 'lost-connection');
    API.alterRegionClasses('remove', 'reconnecting');
    return helpers.connection.disconnect(function() {});
  });
});

this.Kodi.module("Shell", function(Shell, App, Backbone, Marionette, $, _) {
  Shell.Layout = (function(superClass) {
    extend(Layout, superClass);

    function Layout() {
      return Layout.__super__.constructor.apply(this, arguments);
    }

    Layout.prototype.template = "apps/shell/show/shell";

    Layout.prototype.regions = {
      regionNav: '#nav-bar',
      regionContent: '#content',
      regionSidebarFirst: '#sidebar-first',
      regionPlaylist: '#playlist-bar',
      regionTitle: '#page-title .title',
      regionTitleContext: '#page-title .context',
      regionFanart: '#fanart',
      regionPlayerKodi: '#player-kodi',
      regionPlayerLocal: '#player-local',
      regionModal: '#modal-window',
      regionModalTitle: '.modal-title',
      regionModalBody: '.modal-body',
      regionModalFooter: '.modal-footer',
      regionRemote: '#remote',
      regionSearch: '#search-region',
      regionTitle: '#page-title .title',
      regionOffscreen: '#offscreen'
    };

    Layout.prototype.triggers = {
      "click .playlist-toggle-open": "shell:playlist:toggle",
      "click .audio-scan": "shell:audio:scan",
      "click .video-scan": "shell:video:scan",
      "click .goto-lab": "shell:goto:lab",
      "click .send-input": "shell:send:input",
      "click .about": "shell:about",
      "click .selected-play": "shell:selected:play",
      "click .selected-add": "shell:selected:add",
      "click .selected-localadd": "shell:selected:localadd",
      "click .reconnect": "shell:reconnect"
    };

    Layout.prototype.events = {
      "click .player-menu > li": "closePlayerMenu"
    };

    Layout.prototype.closePlayerMenu = function() {
      return App.execute("ui:playermenu", 'close');
    };

    return Layout;

  })(App.Views.LayoutView);
  Shell.HomepageLayout = (function(superClass) {
    extend(HomepageLayout, superClass);

    function HomepageLayout() {
      return HomepageLayout.__super__.constructor.apply(this, arguments);
    }

    HomepageLayout.prototype.template = "apps/shell/show/homepage";

    return HomepageLayout;

  })(Backbone.Marionette.LayoutView);
  return App.execute("shell:view:ready");
});

this.Kodi.module("SongApp.Edit", function(Edit, App, Backbone, Marionette, $, _) {
  return Edit.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var form, options;
      this.model = this.getOption('model');
      options = {
        titleHtml: '<span>' + tr('Edit') + '</span>' + this.model.escape('title'),
        form: this.getStructure(),
        formState: this.model.attributes,
        config: {
          attributes: {
            "class": 'edit-form'
          },
          editForm: true,
          tabs: true,
          callback: (function(_this) {
            return function(data, formView) {
              return _this.saveCallback(data, formView);
            };
          })(this)
        }
      };
      return form = App.request("form:popup:wrapper", options);
    };

    Controller.prototype.getStructure = function() {
      return [
        {
          title: 'General',
          id: 'general',
          children: [
            {
              id: 'title',
              title: tr('Title'),
              type: 'textfield'
            }, {
              id: 'artist',
              title: tr('Artist'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'albumartist',
              title: tr('Album artist'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'album',
              title: tr('Album'),
              type: 'textfield'
            }, {
              id: 'year',
              title: tr('Year'),
              type: 'number',
              format: 'integer',
              attributes: {
                "class": 'half-width',
                step: 1,
                min: 1000,
                max: 9999
              }
            }, {
              id: 'rating',
              title: tr('Rating'),
              type: 'number',
              format: 'float',
              attributes: {
                "class": 'half-width',
                step: 0.1,
                min: 0,
                max: 10
              },
              suffix: '<div class="clearfix"></div>'
            }, {
              id: 'track',
              title: tr('Track'),
              type: 'textfield',
              format: 'integer',
              attributes: {
                "class": 'half-width'
              }
            }, {
              id: 'disc',
              title: tr('Disc'),
              type: 'textfield',
              format: 'integer',
              attributes: {
                "class": 'half-width'
              },
              suffix: '<div class="clearfix"></div>'
            }
          ]
        }, {
          title: 'Tags',
          id: 'tags',
          children: [
            {
              id: 'genre',
              title: tr('Genres'),
              type: 'textfield',
              format: 'array.string'
            }
          ]
        }, {
          title: 'Information',
          id: 'info',
          children: [
            {
              id: 'file',
              title: tr('File path'),
              type: 'textarea',
              attributes: {
                disabled: 'disabled',
                cols: 5
              },
              format: 'prevent.submit'
            }
          ]
        }
      ];
    };

    Controller.prototype.saveCallback = function(data, formView) {
      var controller;
      controller = App.request("command:kodi:controller", 'audio', 'AudioLibrary');
      return controller.setSongDetails(this.model.get('id'), data, (function(_this) {
        return function() {
          Kodi.vent.trigger('entity:kodi:update', _this.model.get('uid'));
          return Kodi.execute("notification:show", t.sprintf(tr("Updated %1$s details"), 'song'));
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("SongApp.List", function(List, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getSongsView: function(songs, verbose) {
      if (verbose == null) {
        verbose = false;
      }
      this.songsView = new List.Songs({
        collection: songs,
        verbose: verbose
      });
      App.listenTo(this.songsView, 'childview:song:play', (function(_this) {
        return function(list, item) {
          return _this.playSong(item.model.get('songid'));
        };
      })(this));
      App.listenTo(this.songsView, 'childview:song:add', (function(_this) {
        return function(list, item) {
          return _this.addSong(item.model.get('songid'));
        };
      })(this));
      App.listenTo(this.songsView, 'childview:song:localadd', (function(_this) {
        return function(list, item) {
          return _this.localAddSong(item.model.get('songid'));
        };
      })(this));
      App.listenTo(this.songsView, 'childview:song:localplay', (function(_this) {
        return function(list, item) {
          return _this.localPlaySong(item.model.get('songid'));
        };
      })(this));
      App.listenTo(this.songsView, 'childview:song:download', (function(_this) {
        return function(list, item) {
          return _this.downloadSong(item.model);
        };
      })(this));
      App.listenTo(this.songsView, 'childview:song:musicvideo', (function(_this) {
        return function(list, item) {
          return App.execute("youtube:search:popup", item.model.get('label') + ' ' + item.model.get('artist'));
        };
      })(this));
      App.listenTo(this.songsView, 'childview:song:edit', function(parent, item) {
        return App.execute('song:edit', item.model);
      });
      App.listenTo(this.songsView, "show", function() {
        return App.vent.trigger("state:content:updated");
      });
      return this.songsView;
    },
    playSong: function(songId) {
      return App.execute("command:audio:play", 'songid', songId);
    },
    addSong: function(songId) {
      return App.execute("command:audio:add", 'songid', songId);
    },
    localAddSong: function(songId) {
      return App.execute("localplaylist:addentity", 'songid', songId);
    },
    localPlaySong: function(songId) {
      var localPlaylist;
      localPlaylist = App.request("command:local:controller", 'audio', 'PlayList');
      return localPlaylist.play('songid', songId);
    },
    downloadSong: function(model) {
      var files;
      files = App.request("command:kodi:controller", 'video', 'Files');
      return files.downloadFile(model.get('file'));
    }
  };
  return App.reqres.setHandler("song:list:view", function(songs, verbose) {
    if (verbose == null) {
      verbose = false;
    }
    return API.getSongsView(songs, verbose);
  });
});

this.Kodi.module("SongApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.Song = (function(superClass) {
    extend(Song, superClass);

    function Song() {
      return Song.__super__.constructor.apply(this, arguments);
    }

    Song.prototype.template = 'apps/song/list/song';

    Song.prototype.tagName = "tr";

    Song.prototype.initialize = function() {
      var duration, menu;
      Song.__super__.initialize.apply(this, arguments);
      if (this.model) {
        duration = helpers.global.secToTime(this.model.get('duration'));
        menu = {
          'song-localadd': 'Add to playlist',
          'song-download': 'Download song',
          'song-localplay': 'Play in browser',
          'song-musicvideo': 'Music video',
          'divider': '',
          'song-edit': 'Edit'
        };
        return this.model.set({
          displayDuration: helpers.global.formatTime(duration),
          menu: menu
        });
      }
    };

    Song.prototype.triggers = {
      "click .play": "song:play",
      "dblclick .song-title": "song:play",
      "click .add": "song:add",
      "click .song-localadd": "song:localadd",
      "click .song-download": "song:download",
      "click .song-localplay": "song:localplay",
      "click .song-musicvideo": "song:musicvideo",
      "click .song-remove": "song:remove",
      "click .song-edit": "song:edit"
    };

    Song.prototype.events = {
      "click .dropdown > i": "populateModelMenu",
      "click .thumbs": "toggleThumbs",
      "click": "toggleSelect"
    };

    Song.prototype.modelEvents = {
      'change': 'render'
    };

    Song.prototype.toggleThumbs = function() {
      App.request("thumbsup:toggle:entity", this.model);
      this.$el.toggleClass('thumbs-up');
      return $('.plitem-' + this.model.get('type') + '-' + this.model.get('id')).toggleClass('thumbs-up');
    };

    Song.prototype.attributes = function() {
      var classes;
      if (this.model) {
        classes = ['song', 'table-row', 'can-play', 'item-' + this.model.get('uid')];
        if (App.request("thumbsup:check", this.model)) {
          classes.push('thumbs-up');
        }
        return {
          'class': classes.join(' '),
          'data-id': this.model.id
        };
      }
    };

    Song.prototype.onShow = function() {
      return this.menuBlur();
    };

    Song.prototype.onRender = function() {
      return this.$el.data('model', this.model);
    };

    return Song;

  })(App.Views.ItemView);
  return List.Songs = (function(superClass) {
    extend(Songs, superClass);

    function Songs() {
      return Songs.__super__.constructor.apply(this, arguments);
    }

    Songs.prototype.childView = List.Song;

    Songs.prototype.placeHolderViewName = 'SongViewPlaceholder';

    Songs.prototype.cardSelector = '.song';

    Songs.prototype.preload = 40;

    Songs.prototype.tagName = "table";

    Songs.prototype.attributes = function() {
      var verbose;
      verbose = this.options.verbose ? 'verbose' : 'basic';
      return {
        "class": 'songs-table table table-hover ' + verbose
      };
    };

    return Songs;

  })(App.Views.VirtualListView);
});

this.Kodi.module("SongApp", function(SongApp, App, Backbone, Marionette, $, _) {
  return App.commands.setHandler('song:edit', function(model) {
    var loadedModel;
    loadedModel = App.request("song:entity", model.get('songid'));
    return App.execute("when:entity:fetched", loadedModel, (function(_this) {
      return function() {
        return new SongApp.Edit.Controller({
          model: loadedModel
        });
      };
    })(this));
  });
});

this.Kodi.module("StateApp", function(StateApp, App, Backbone, Marionette, $, _) {
  return StateApp.Base = (function(superClass) {
    extend(Base, superClass);

    function Base() {
      return Base.__super__.constructor.apply(this, arguments);
    }

    Base.prototype.instanceSettings = {};

    Base.prototype.state = {
      player: 'kodi',
      media: 'audio',
      volume: 50,
      lastVolume: 50,
      muted: false,
      shuffled: false,
      repeat: 'off',
      version: {
        major: 15,
        minor: 0
      }
    };

    Base.prototype.playing = {
      playing: false,
      paused: false,
      playState: '',
      item: {},
      media: 'audio',
      itemChanged: false,
      latPlaying: '',
      canrepeat: true,
      canseek: true,
      canshuffle: true,
      partymode: false,
      percentage: 0,
      playlistid: 0,
      position: 0,
      speed: 0,
      time: {
        hours: 0,
        milliseconds: 0,
        minutes: 0,
        seconds: 0
      },
      totaltime: {
        hours: 0,
        milliseconds: 0,
        minutes: 0,
        seconds: 0
      }
    };

    Base.prototype.defaultPlayingItem = {
      thumbnail: '',
      fanart: '',
      id: 0,
      songid: 0,
      episodeid: 0,
      album: '',
      albumid: '',
      duration: 0,
      type: 'song'
    };

    Base.prototype.getState = function(key) {
      if (key == null) {
        key = 'all';
      }
      if (key === 'all') {
        return this.state;
      } else {
        return this.state[key];
      }
    };

    Base.prototype.setState = function(key, value) {
      return this.state[key] = value;
    };

    Base.prototype.getPlaying = function(key) {
      var ret;
      if (key == null) {
        key = 'all';
      }
      ret = this.playing;
      if (ret.item.length === 0) {
        ret.item = this.defaultPlayingItem;
      }
      if (key === 'all') {
        return this.playing;
      } else {
        return this.playing[key];
      }
    };

    Base.prototype.setPlaying = function(key, value) {
      return this.playing[key] = value;
    };

    Base.prototype.isPlaying = function(media) {
      if (media == null) {
        media = 'auto';
      }
      if (media === 'auto') {
        return this.getPlaying('playing');
      } else {
        return media === this.getState('media') && this.getPlaying('playing');
      }
    };

    Base.prototype.isPlayingItemChanged = function() {
      return this.getPlaying('itemChanged');
    };

    Base.prototype.doCallback = function(callback, resp) {
      if (typeof callback === 'function') {
        return callback(resp);
      }
    };

    Base.prototype.getCurrentState = function(callback) {};

    Base.prototype.getCachedState = function() {
      return {
        state: this.state,
        playing: this.playing
      };
    };

    Base.prototype.setPlayer = function(player) {
      var $body;
      if (player == null) {
        player = 'kodi';
      }
      $body = App.getRegion('root').$el;
      $body.removeClassStartsWith('active-player-').addClass('active-player-' + player);
      config.set('state', 'lastplayer', player);
      return config.set('app', 'state:lastplayer', player);
    };

    Base.prototype.getPlayer = function() {
      var $body, player;
      player = 'kodi';
      $body = App.getRegion('root').$el;
      if ($body.hasClass('active-player-local')) {
        player = 'local';
      }
      return player;
    };

    return Base;

  })(Marionette.Object);
});

this.Kodi.module("StateApp.Kodi", function(StateApp, App, Backbone, Marionette, $, _) {
  return StateApp.State = (function(superClass) {
    extend(State, superClass);

    function State() {
      return State.__super__.constructor.apply(this, arguments);
    }

    State.prototype.playerController = {};

    State.prototype.applicationController = {};

    State.prototype.playlistApi = {};

    State.prototype.initialize = function() {
      this.state = _.extend({}, this.state);
      this.playing = _.extend({}, this.playing);
      this.setState('player', 'kodi');
      this.playerController = App.request("command:kodi:controller", 'auto', 'Player');
      this.applicationController = App.request("command:kodi:controller", 'auto', 'Application');
      this.playlistApi = App.request("playlist:kodi:entity:api");
      App.reqres.setHandler("state:kodi:update", (function(_this) {
        return function(callback) {
          return _this.getCurrentState(callback);
        };
      })(this));
      return App.reqres.setHandler("state:kodi:get", (function(_this) {
        return function() {
          return _this.getCachedState();
        };
      })(this));
    };

    State.prototype.getCurrentState = function(callback) {
      return this.applicationController.getProperties((function(_this) {
        return function(properties) {
          _this.setState('volume', properties.volume);
          _this.setState('muted', properties.muted);
          _this.setState('version', properties.version);
          App.reqres.setHandler('player:kodi:timer', 'stop');
          return _this.playerController.getPlaying(function(playing) {
            var autoMap, key, len, media, n;
            if (playing) {
              _this.setPlaying('playing', true);
              _this.setPlaying('paused', playing.properties.speed === 0);
              _this.setPlaying('playState', (playing.properties.speed === 0 ? 'paused' : 'playing'));
              autoMap = ['canrepeat', 'canseek', 'canshuffle', 'partymode', 'percentage', 'playlistid', 'position', 'speed', 'time', 'totaltime'];
              for (n = 0, len = autoMap.length; n < len; n++) {
                key = autoMap[n];
                if (playing.properties[key] != null) {
                  _this.setPlaying(key, playing.properties[key]);
                }
              }
              _this.setState('shuffled', playing.properties.shuffled);
              _this.setState('repeat', playing.properties.repeat);
              media = _this.playerController.playerIdToName(playing.properties.playlistid);
              if (media) {
                _this.setState('media', media);
              }
              if (playing.item.file !== _this.getPlaying('lastPlaying')) {
                _this.setPlaying('itemChanged', true);
                App.vent.trigger("state:kodi:itemchanged", _this.getCachedState());
              } else {
                _this.setPlaying('itemChanged', false);
              }
              _this.setPlaying('lastPlaying', playing.item.file);
              _this.setPlaying('item', _this.parseItem(playing.item, {
                media: media,
                playlistid: playing.properties.playlistid
              }));
              App.reqres.setHandler('player:kodi:timer', 'start');
            } else {
              _this.setPlaying('playing', false);
              _this.setPlaying('paused', false);
              _this.setPlaying('item', _this.defaultPlayingItem);
              _this.setPlaying('lstPlaying', '');
            }
            App.vent.trigger("state:kodi:changed", _this.getCachedState());
            App.vent.trigger("state:changed");
            return _this.doCallback(callback, _this.getCachedState());
          });
        };
      })(this));
    };

    State.prototype.parseItem = function(model, options) {
      model = this.playlistApi.parseItem(model, options);
      model = App.request("images:path:entity", model);
      model.url = helpers.url.get(model.type, model.id);
      model.url = helpers.url.playlistUrl(model);
      return model;
    };

    return State;

  })(App.StateApp.Base);
});

this.Kodi.module("StateApp.Kodi", function(StateApp, App, Backbone, Marionette, $, _) {
  return StateApp.Notifications = (function(superClass) {
    extend(Notifications, superClass);

    function Notifications() {
      return Notifications.__super__.constructor.apply(this, arguments);
    }

    Notifications.prototype.wsActive = false;

    Notifications.prototype.wsObj = {};

    Notifications.prototype.getConnection = function() {
      var host, protocol, socketHost, socketPath, socketPort;
      host = config.getLocal('socketsHost');
      socketPath = config.getLocal('jsonRpcEndpoint');
      socketPort = config.getLocal('socketsPort');
      socketHost = host === 'auto' ? location.hostname : host;
      protocol = helpers.url.isSecureProtocol() ? "wss" : "ws";
      return protocol + "://" + socketHost + ":" + socketPort + "/" + socketPath + "?kodi";
    };

    Notifications.prototype.initialize = function() {
      var msg, ws;
      if (window.WebSocket) {
        ws = new WebSocket(this.getConnection());
        ws.onopen = (function(_this) {
          return function(e) {
            helpers.debug.msg("Websockets Active");
            _this.wsActive = true;
            return App.vent.trigger("sockets:available");
          };
        })(this);
        ws.onerror = (function(_this) {
          return function(resp) {
            helpers.debug.msg(_this.socketConnectionErrorMsg(), "warning", resp);
            _this.wsActive = false;
            return App.vent.trigger("sockets:unavailable");
          };
        })(this);
        ws.onmessage = (function(_this) {
          return function(resp) {
            return _this.messageReceived(resp);
          };
        })(this);
        ws.onclose = (function(_this) {
          return function(resp) {
            helpers.debug.msg("Websockets Closed", "warning", resp);
            _this.wsActive = false;
            App.execute("notification:show", tr("Lost websocket connection"));
            return setTimeout(function() {
              App.execute("notification:show", tr("Attempting websockets reconnect"));
              return App.execute('state:ws:init');
            }, 60000);
          };
        })(this);
      } else {
        msg = "Your browser doesn't support websockets! Get with the times and update your browser.";
        helpers.debug.msg(t.gettext(msg), "warning", resp);
        App.vent.trigger("sockets:unavailable");
      }
      return App.reqres.setHandler("sockets:active", (function(_this) {
        return function() {
          return _this.wsActive;
        };
      })(this));
    };

    Notifications.prototype.parseResponse = function(resp) {
      return jQuery.parseJSON(resp.data);
    };

    Notifications.prototype.messageReceived = function(resp) {
      var data;
      data = this.parseResponse(resp);
      return this.onMessage(data);
    };

    Notifications.prototype.socketConnectionErrorMsg = function() {
      var msg;
      msg = "Failed to connect to websockets";
      return t.gettext(msg);
    };

    Notifications.prototype.refreshStateNow = function(callback) {
      App.vent.trigger("state:kodi:changed", this.getCachedState());
      return setTimeout(((function(_this) {
        return function() {
          return App.request("state:kodi:update", function(state) {
            if (callback) {
              return callback(state);
            }
          });
        };
      })(this)), 1000);
    };

    Notifications.prototype.onLibraryUpdate = function(data) {
      var model;
      model = data.params.data.item ? data.params.data.item : data.params.data;
      model.uid = helpers.entities.createUid(model, model.type);
      App.vent.trigger('entity:kodi:update', model.uid);
      if (model.type === 'episode') {
        clearTimeout(App.episodeRecheckTimeout);
        return App.episodeRecheckTimeout = setTimeout(function() {
          return App.request('episode:entity', model.id, {
            success: function(epModel) {
              return App.vent.trigger('entity:kodi:update', 'tvshow-' + epModel.get('tvshowid'));
            }
          });
        }, 2000);
      }
    };

    Notifications.prototype.onMessage = function(data) {
      var wait;
      switch (data.method) {
        case 'Player.OnPlay':
          this.setPlaying('paused', false);
          this.setPlaying('playState', 'playing');
          App.execute("player:kodi:timer", 'start');
          this.refreshStateNow();
          break;
        case 'Player.OnResume':
          this.setPlaying('paused', false);
          this.setPlaying('playState', 'playing');
          App.execute("player:kodi:timer", 'start');
          this.refreshStateNow();
          break;
        case 'Player.OnStop':
          this.setPlaying('playing', false);
          App.execute("player:kodi:timer", 'stop');
          this.refreshStateNow();
          break;
        case 'Player.OnPropertyChanged':
          this.refreshStateNow();
          break;
        case 'Player.OnPause':
          this.setPlaying('paused', true);
          this.setPlaying('playState', 'paused');
          App.execute("player:kodi:timer", 'stop');
          this.refreshStateNow();
          break;
        case 'Player.OnSeek':
          App.execute("player:kodi:timer", 'stop');
          this.refreshStateNow(function() {
            return App.execute("player:kodi:timer", 'start');
          });
          break;
        case 'Playlist.OnClear':
        case 'Playlist.OnAdd':
        case 'Playlist.OnRemove':
          clearTimeout(App.playlistUpdateTimeout);
          App.playlistUpdateTimeout = setTimeout((function(_this) {
            return function(e) {
              var playerController;
              playerController = App.request("command:kodi:controller", 'auto', 'Player');
              App.execute("playlist:refresh", 'kodi', playerController.playerIdToName(data.params.data.playlistid));
              return _this.refreshStateNow();
            };
          })(this), 500);
          break;
        case 'Application.OnVolumeChanged':
          App.request("state:kodi").getCurrentState();
          break;
        case 'VideoLibrary.OnScanStarted':
          App.execute("notification:show", t.gettext("Video library scan started"));
          break;
        case 'VideoLibrary.OnScanFinished':
          App.execute("notification:show", t.gettext("Video library scan complete"));
          Backbone.fetchCache.clearItem('MovieCollection');
          Backbone.fetchCache.clearItem('TVShowCollection');
          break;
        case 'AudioLibrary.OnScanStarted':
          App.execute("notification:show", t.gettext("Audio library scan started"));
          break;
        case 'AudioLibrary.OnScanFinished':
          App.execute("notification:show", t.gettext("Audio library scan complete"));
          Backbone.fetchCache.clearItem('AlbumCollection');
          Backbone.fetchCache.clearItem('ArtistCollection');
          break;
        case 'AudioLibrary.OnCleanStarted':
          App.execute("notification:show", t.gettext("Audio library clean started"));
          break;
        case 'AudioLibrary.OnCleanFinished':
          App.execute("notification:show", t.gettext("Audio library clean finished"));
          break;
        case 'VideoLibrary.OnCleanStarted':
          App.execute("notification:show", t.gettext("Video library clean started"));
          break;
        case 'VideoLibrary.OnCleanFinished':
          App.execute("notification:show", t.gettext("Video library clean finished"));
          break;
        case 'AudioLibrary.OnUpdate':
        case 'VideoLibrary.OnUpdate':
          this.onLibraryUpdate(data);
          break;
        case 'Input.OnInputRequested':
          App.execute("input:textbox", '');
          wait = 60;
          App.inputTimeout = setTimeout((function() {
            var msg, wotd;
            wotd = '<a href="http://goo.gl/PGE7wg" target="_blank">word of the day</a>';
            msg = t.sprintf(tr("%1$d seconds ago, an input dialog opened in Kodi and it is still open! To prevent " + "a mainframe implosion, you should probably give me some text. I don't really care what it " + "is at this point, why not be creative? Do you have a %2$s? I won't tell..."), wait, wotd);
            App.execute("input:textbox", msg);
          }), 1000 * wait);
          break;
        case 'Input.OnInputFinished':
          clearTimeout(App.inputTimeout);
          App.execute("input:textbox:close");
          break;
        case 'System.OnQuit':
          App.execute("notification:show", t.gettext("Kodi has quit"));
          App.execute("shell:disconnect");
          break;
        case 'System.OnWake':
        case 'System.OnRestart':
          App.execute("shell:reconnect");
          break;
      }
    };

    return Notifications;

  })(App.StateApp.Base);
});

this.Kodi.module("StateApp.Kodi", function(StateApp, App, Backbone, Marionette, $, _) {
  return StateApp.Polling = (function(superClass) {
    extend(Polling, superClass);

    function Polling() {
      return Polling.__super__.constructor.apply(this, arguments);
    }

    Polling.prototype.commander = {};

    Polling.prototype.checkInterval = 10000;

    Polling.prototype.currentInterval = '';

    Polling.prototype.timeoutObj = {};

    Polling.prototype.failures = 0;

    Polling.prototype.maxFailures = 100;

    Polling.prototype.initialize = function() {
      var interval;
      interval = config.getLocal('pollInterval');
      this.checkInterval = parseInt(interval);
      return this.currentInterval = this.checkInterval;
    };

    Polling.prototype.startPolling = function() {
      return this.update();
    };

    Polling.prototype.updateState = function() {
      var stateObj;
      stateObj = App.request("state:kodi");
      return stateObj.getCurrentState();
    };

    Polling.prototype.update = function() {
      if (config.getLocal('connected', true) === false) {
        return;
      }
      if (App.kodiPolling.failures < App.kodiPolling.maxFailures) {
        App.kodiPolling.updateState();
        return App.kodiPolling.timeout = setTimeout(App.kodiPolling.ping, App.kodiPolling.currentInterval);
      } else {
        App.execute("notification:show", t.gettext("Unable to communicate with Kodi in a long time. I think it's dead Jim!"));
        return App.execute("shell:disconnect");
      }
    };

    Polling.prototype.ping = function() {
      var commander;
      commander = App.request("command:kodi:controller", 'auto', 'Commander');
      commander.setOptions({
        timeout: 5000,
        error: function() {
          return App.kodiPolling.failure();
        }
      });
      commander.onError = function() {};
      return commander.sendCommand('Ping', [], function() {
        return App.kodiPolling.alive();
      });
    };

    Polling.prototype.alive = function() {
      App.kodiPolling.failures = 0;
      App.kodiPolling.currentInterval = App.kodiPolling.checkInterval;
      return App.kodiPolling.update();
    };

    Polling.prototype.failure = function() {
      App.kodiPolling.failures++;
      if (App.kodiPolling.failures > 10) {
        App.kodiPolling.currentInterval = App.kodiPolling.checkInterval * 5;
      }
      if (App.kodiPolling.failures > 20) {
        App.kodiPolling.currentInterval = App.kodiPolling.checkInterval * 10;
      }
      if (App.kodiPolling.failures > 30) {
        App.kodiPolling.currentInterval = App.kodiPolling.checkInterval * 30;
      }
      return App.kodiPolling.update();
    };

    return Polling;

  })(App.StateApp.Base);
});

this.Kodi.module("StateApp.Local", function(StateApp, App, Backbone, Marionette, $, _) {
  return StateApp.State = (function(superClass) {
    extend(State, superClass);

    function State() {
      return State.__super__.constructor.apply(this, arguments);
    }

    State.prototype.initialize = function() {
      this.state = _.extend({}, this.state);
      this.playing = _.extend({}, this.playing);
      this.setState('player', 'local');
      this.setState('currentPlaybackId', 'browser-none');
      this.setState('localPlay', false);
      App.reqres.setHandler("state:local:update", (function(_this) {
        return function(callback) {
          return _this.getCurrentState(callback);
        };
      })(this));
      return App.reqres.setHandler("state:local:get", (function(_this) {
        return function() {
          return _this.getCachedState();
        };
      })(this));
    };

    State.prototype.getCurrentState = function(callback) {
      return this.doCallback(callback, this.getCachedState());
    };

    return State;

  })(App.StateApp.Base);
});

this.Kodi.module("StateApp", function(StateApp, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    setState: function(player) {
      if (player == null) {
        player = 'kodi';
      }
      this.setBodyClasses(player);
      this.setPlayingContent(player);
      this.setPlayerPlaying(player);
      this.setAppProperties(player);
      return this.setTitle(player);
    },
    playerClass: function(className, player) {
      return player + '-' + className;
    },
    setBodyClasses: function(player) {
      var $body, c, len, n, newClasses, results1, stateObj;
      stateObj = App.request("state:" + player);
      $body = App.getRegion('root').$el;
      $body.removeClassStartsWith(player + '-');
      newClasses = [];
      newClasses.push('shuffled-' + (stateObj.getState('shuffled') ? 'on' : 'off'));
      newClasses.push('partymode-' + (stateObj.getPlaying('partymode') ? 'on' : 'off'));
      newClasses.push('mute-' + (stateObj.getState('muted') ? 'on' : 'off'));
      newClasses.push('repeat-' + stateObj.getState('repeat'));
      newClasses.push('media-' + stateObj.getState('media'));
      if (stateObj.isPlaying()) {
        newClasses.push(stateObj.getPlaying('playState'));
      } else {
        newClasses.push('not-playing');
      }
      results1 = [];
      for (n = 0, len = newClasses.length; n < len; n++) {
        c = newClasses[n];
        results1.push($body.addClass(this.playerClass(c, player)));
      }
      return results1;
    },
    setPlayingContent: function(player) {
      var $plItem, $playlistCtx, className, item, playState, stateObj;
      stateObj = App.request("state:" + player);
      $playlistCtx = $('.media-' + stateObj.getState('media') + ' .' + player + '-playlist');
      $('.can-play').removeClassStartsWith(player + '-row-');
      $('.item', $playlistCtx).removeClassStartsWith('row-');
      if (stateObj.isPlaying()) {
        item = stateObj.getPlaying('item');
        playState = stateObj.getPlaying('playState');
        className = '.item-' + item.uid;
        $(className).addClass(this.playerClass('row-' + playState, player));
        $plItem = $('.pos-' + stateObj.getPlaying('position'), $playlistCtx).addClass('row-' + playState);
        if ($plItem.data('type') === 'file') {
          $('.thumb', $plItem).css("background-image", "url('" + item.thumbnail + "')");
          $('.title', $plItem).html(helpers.entities.playingLink(item));
        }
        return App.vent.trigger("state:" + player + ":playing:updated", stateObj);
      }
    },
    setPlayerPlaying: function(player) {
      var $dur, $img, $playerCtx, $subtitle, $title, item, stateObj;
      stateObj = App.request("state:" + player);
      $playerCtx = $('#player-' + player);
      $title = $('.playing-title', $playerCtx);
      $subtitle = $('.playing-subtitle', $playerCtx);
      $dur = $('.playing-time-duration', $playerCtx);
      $img = $('.playing-thumb', $playerCtx);
      if (stateObj.isPlaying()) {
        item = stateObj.getPlaying('item');
        $title.html(helpers.entities.playingLink(item));
        $subtitle.html(helpers.entities.getSubtitle(item));
        $dur.text(helpers.global.formatTime(stateObj.getPlaying('totaltime')));
        return $img.css("background-image", "url('" + item.thumbnail + "')");
      } else {
        $title.html(t.gettext('Nothing playing'));
        $subtitle.html('');
        $dur.text('0');
        return $img.attr('src', App.request("images:path:get"));
      }
    },
    setAppProperties: function(player) {
      var $playerCtx, stateObj;
      stateObj = App.request("state:" + player);
      $playerCtx = $('#player-' + player);
      return $('.volume', $playerCtx).val(stateObj.getState('volume'));
    },
    setTitle: function(player) {
      var stateObj;
      if (player === 'kodi') {
        stateObj = App.request("state:" + player);
        if (stateObj.isPlaying() && stateObj.getPlaying('playState') === 'playing') {
          return helpers.global.appTitle(stateObj.getPlaying('item'));
        } else {
          return helpers.global.appTitle();
        }
      }
    },
    getDefaultPlayer: function() {
      var player;
      player = config.getLocal('defaultPlayer', 'auto');
      if (player === 'auto') {
        player = config.get('app', 'state:lastplayer', 'kodi');
      }
      return player;
    },
    initKodiState: function() {
      App.kodiState = new StateApp.Kodi.State();
      App.localState = new StateApp.Local.State();
      App.kodiState.setPlayer(this.getDefaultPlayer());
      App.kodiState.getCurrentState(function(state) {
        API.setState('kodi');
        App.kodiSockets = new StateApp.Kodi.Notifications();
        App.kodiPolling = new StateApp.Kodi.Polling();
        App.vent.on("sockets:unavailable", function() {
          return App.kodiPolling.startPolling();
        });
        App.vent.on("playlist:rendered", function() {
          return App.request("playlist:refresh", App.kodiState.getState('player'), App.kodiState.getState('media'));
        });
        App.vent.on("state:content:updated", function() {
          API.setPlayingContent('kodi');
          return API.setPlayingContent('local');
        });
        App.vent.on("state:kodi:changed", function(state) {
          return API.setState('kodi');
        });
        App.vent.on("state:local:changed", function(state) {
          return API.setState('local');
        });
        App.vent.on("state:player:updated", function(player) {
          return API.setPlayerPlaying(player);
        });
        return App.vent.trigger("state:initialized");
      });
      App.reqres.setHandler("state:kodi", function() {
        return App.kodiState;
      });
      App.reqres.setHandler("state:local", function() {
        return App.localState;
      });
      App.reqres.setHandler("state:current", function() {
        var stateObj;
        stateObj = App.kodiState.getPlayer() === 'kodi' ? App.kodiState : App.localState;
        return stateObj;
      });
      App.commands.setHandler('state:ws:init', function() {
        return App.kodiSockets = new StateApp.Kodi.Notifications();
      });
      return App.vent.trigger("state:changed");
    }
  };
  return App.addInitializer(function() {
    return API.initKodiState();
  });
});

this.Kodi.module("ThumbsApp.List", function(List, App, Backbone, Marionette, $, _) {
  return List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.entityTitles = {
      musicvideo: 'music video'
    };

    Controller.prototype.initialize = function() {
      var entities;
      this.layout = this.getLayout();
      entities = ['song', 'artist', 'album', 'tvshow', 'movie', 'episode', 'musicvideo'];
      this.listenTo(this.layout, "show", (function(_this) {
        return function() {
          var entity, len, n, results1;
          results1 = [];
          for (n = 0, len = entities.length; n < len; n++) {
            entity = entities[n];
            results1.push(_this.getResult(entity));
          }
          return results1;
        };
      })(this));
      return App.regionContent.show(this.layout);
    };

    Controller.prototype.getLayout = function() {
      return new List.ListLayout();
    };

    Controller.prototype.getResult = function(entity) {
      var limit, loaded, query, setView, view;
      query = this.getOption('query');
      limit = this.getOption('media') === 'all' ? 'limit' : 'all';
      loaded = App.request("thumbsup:get:entities", entity);
      if (loaded.length > 0) {
        view = App.request(entity + ":list:view", loaded, true);
        setView = new List.ListSet({
          entity: this.getTitle(entity)
        });
        App.listenTo(setView, "show", (function(_this) {
          return function() {
            return setView.regionResult.show(view);
          };
        })(this));
        return this.layout[entity + "Set"].show(setView);
      }
    };

    Controller.prototype.getTitle = function(entity) {
      var title;
      title = this.entityTitles[entity] ? this.entityTitles[entity] : entity;
      return title;
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("ThumbsApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.template = 'apps/thumbs/list/thumbs_layout';

    ListLayout.prototype.className = "thumbs-page set-page";

    ListLayout.prototype.regions = {
      artistSet: '.entity-set-artist',
      albumSet: '.entity-set-album',
      songSet: '.entity-set-song',
      movieSet: '.entity-set-movie',
      tvshowSet: '.entity-set-tvshow',
      episodeSet: '.entity-set-episode',
      musicvideoSet: '.entity-set-musicvideo'
    };

    return ListLayout;

  })(App.Views.LayoutView);
  return List.ListSet = (function(superClass) {
    extend(ListSet, superClass);

    function ListSet() {
      return ListSet.__super__.constructor.apply(this, arguments);
    }

    ListSet.prototype.template = 'apps/thumbs/list/thumbs_set';

    ListSet.prototype.className = "thumbs-set";

    ListSet.prototype.onRender = function() {
      if (this.options) {
        if (this.options.entity) {
          return $('h2.set-header', this.$el).text(t.gettext(this.options.entity + 's'));
        }
      }
    };

    ListSet.prototype.regions = {
      regionResult: '.set-results'
    };

    return ListSet;

  })(App.Views.LayoutView);
});

this.Kodi.module("ThumbsApp", function(ThumbsApp, App, Backbone, Marionette, $, _) {
  var API;
  ThumbsApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "thumbsup": "list"
    };

    return Router;

  })(App.Router.Base);
  API = {
    list: function() {
      return new ThumbsApp.List.Controller();
    }
  };
  return App.on("before:start", function() {
    return new ThumbsApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("TVShowApp.EditEpisode", function(Edit, App, Backbone, Marionette, $, _) {
  return Edit.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var form, options;
      this.model = this.getOption('model');
      options = {
        titleHtml: '<span>' + tr('Edit') + '</span>' + this.model.escape('showtitle') + ' - ' + this.model.escape('title') + ' (S' + this.model.escape('season') + ' E' + this.model.escape('episode') + ')',
        form: this.getStructure(),
        formState: this.model.attributes,
        config: {
          attributes: {
            "class": 'edit-form'
          },
          editForm: true,
          tabs: true,
          callback: (function(_this) {
            return function(data, formView) {
              return _this.saveCallback(data, formView);
            };
          })(this)
        }
      };
      return form = App.request("form:popup:wrapper", options);
    };

    Controller.prototype.getStructure = function() {
      return [
        {
          title: 'General',
          id: 'general',
          children: [
            {
              id: 'title',
              title: tr('Title'),
              type: 'textfield'
            }, {
              id: 'plot',
              title: tr('Plot'),
              type: 'textarea'
            }, {
              id: 'rating',
              title: tr('Rating'),
              type: 'number',
              format: 'float',
              attributes: {
                "class": 'half-width',
                step: 0.1,
                min: 0,
                max: 10
              }
            }, {
              id: 'firstaired',
              title: tr('First aired'),
              type: 'date',
              attributes: {
                "class": 'half-width'
              },
              suffix: '<div class="clearfix"></div>'
            }, {
              id: 'originaltitle',
              title: tr('Original title'),
              type: 'textfield'
            }
          ]
        }, {
          title: 'Tags',
          id: 'tags',
          children: [
            {
              id: 'director',
              title: tr('Directors'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'writer',
              title: tr('Writers'),
              type: 'textfield',
              format: 'array.string'
            }
          ]
        }, {
          title: 'Information',
          id: 'info',
          children: [
            {
              id: 'file',
              title: tr('File path'),
              type: 'textarea',
              attributes: {
                disabled: 'disabled',
                cols: 5
              },
              format: 'prevent.submit'
            }
          ]
        }
      ];
    };

    Controller.prototype.saveCallback = function(data, formView) {
      var controller;
      controller = App.request("command:kodi:controller", 'video', 'VideoLibrary');
      return controller.setEpisodeDetails(this.model.get('id'), data, (function(_this) {
        return function() {
          Kodi.vent.trigger('entity:kodi:update', _this.model.get('uid'));
          return Kodi.execute("notification:show", t.sprintf(tr("Updated %1$s details"), 'episode'));
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("TVShowApp.EditShow", function(Edit, App, Backbone, Marionette, $, _) {
  return Edit.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var form, options;
      this.model = this.getOption('model');
      options = {
        titleHtml: '<span>' + tr('Edit') + '</span>' + this.model.escape('title'),
        form: this.getStructure(),
        formState: this.model.attributes,
        config: {
          attributes: {
            "class": 'edit-form'
          },
          editForm: true,
          tabs: true,
          callback: (function(_this) {
            return function(data, formView) {
              return _this.saveCallback(data, formView);
            };
          })(this)
        }
      };
      return form = App.request("form:popup:wrapper", options);
    };

    Controller.prototype.getStructure = function() {
      return [
        {
          title: 'General',
          id: 'general',
          children: [
            {
              id: 'title',
              title: tr('Title'),
              type: 'textfield'
            }, {
              id: 'plot',
              title: tr('Plot'),
              type: 'textarea'
            }, {
              id: 'studio',
              title: tr('Studio'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'mpaa',
              title: tr('Content rating'),
              type: 'textfield',
              attributes: {
                "class": 'half-width'
              }
            }, {
              id: 'premiered',
              title: tr('Premiered'),
              type: 'date',
              attributes: {
                "class": 'half-width'
              },
              suffix: '<div class="clearfix"></div>'
            }, {
              id: 'rating',
              title: tr('Rating'),
              type: 'number',
              format: 'float',
              attributes: {
                "class": 'half-width',
                step: 0.1,
                min: 0,
                max: 10
              }
            }, {
              id: 'imdbnumber',
              title: tr('IMDb'),
              type: 'textfield',
              attributes: {
                "class": 'half-width'
              },
              suffix: '<div class="clearfix"></div>'
            }, {
              id: 'sorttitle',
              title: tr('Sort title'),
              type: 'textfield'
            }, {
              id: 'originaltitle',
              title: tr('Original title'),
              type: 'textfield'
            }
          ]
        }, {
          title: 'Tags',
          id: 'tags',
          children: [
            {
              id: 'genre',
              title: tr('Genres'),
              type: 'textfield',
              format: 'array.string'
            }, {
              id: 'tag',
              title: tr('Tags'),
              type: 'textarea',
              format: 'array.string'
            }
          ]
        }, {
          title: 'Poster',
          id: 'poster',
          children: [
            {
              id: 'thumbnail',
              title: tr('URL'),
              type: 'imageselect',
              valueProperty: 'thumbnailOriginal',
              description: tr('Add an image via an external URL'),
              metadataImageHandler: 'themoviedb:tv:image:entities',
              metadataLookupField: 'imdbnumber'
            }
          ]
        }, {
          title: 'Background',
          id: 'background',
          children: [
            {
              id: 'fanart',
              title: tr('URL'),
              type: 'imageselect',
              valueProperty: 'fanartOriginal',
              description: tr('Add an image via an external URL'),
              metadataImageHandler: 'themoviedb:tv:image:entities',
              metadataLookupField: 'imdbnumber'
            }
          ]
        }
      ];
    };

    Controller.prototype.saveCallback = function(data, formView) {
      var controller;
      controller = App.request("command:kodi:controller", 'video', 'VideoLibrary');
      return controller.setTVShowDetails(this.model.get('id'), data, (function(_this) {
        return function() {
          Kodi.vent.trigger('entity:kodi:update', _this.model.get('uid'));
          return Kodi.execute("notification:show", t.sprintf(tr("Updated %1$s details"), 'tvshow'));
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("TVShowApp.Episode", function(Episode, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getEpisodeList: function(collection) {
      var view;
      view = new Episode.Episodes({
        collection: collection
      });
      App.listenTo(view, 'childview:episode:play', function(parent, viewItem) {
        return App.execute('episode:action', 'play', viewItem);
      });
      App.listenTo(view, 'childview:episode:add', function(parent, viewItem) {
        return App.execute('episode:action', 'add', viewItem);
      });
      App.listenTo(view, 'childview:episode:localplay', function(parent, viewItem) {
        return App.execute('episode:action', 'localplay', viewItem);
      });
      App.listenTo(view, 'childview:episode:download', function(parent, viewItem) {
        return App.execute('episode:action', 'download', viewItem);
      });
      App.listenTo(view, 'childview:episode:watched', function(parent, viewItem) {
        return App.execute('episode:action:watched', parent, viewItem);
      });
      App.listenTo(view, 'childview:episode:goto:season', function(parent, viewItem) {
        return App.execute('episode:action', 'gotoSeason', viewItem);
      });
      App.listenTo(view, 'childview:episode:edit', function(parent, viewItem) {
        return App.execute('episode:edit', viewItem.model);
      });
      return view;
    },
    bindTriggers: function(view) {
      App.listenTo(view, 'episode:play', function(viewItem) {
        return App.execute('episode:action', 'play', viewItem);
      });
      App.listenTo(view, 'episode:add', function(viewItem) {
        return App.execute('episode:action', 'add', viewItem);
      });
      App.listenTo(view, 'episode:localplay', function(viewItem) {
        return App.execute('episode:action', 'localplay', viewItem);
      });
      App.listenTo(view, 'episode:download', function(viewItem) {
        return App.execute('episode:action', 'download', viewItem);
      });
      App.listenTo(view, 'toggle:watched', function(viewItem) {
        return App.execute('episode:action:watched', viewItem.view, viewItem.view);
      });
      App.listenTo(view, 'episode:refresh', function(viewItem) {
        return App.execute('episode:action', 'refresh', viewItem);
      });
      return App.listenTo(view, 'episode:edit', function(viewItem) {
        return App.execute('episode:edit', viewItem.model);
      });
    }
  };
  Episode.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var episode, episodeId, id, seasonId;
      id = parseInt(options.id);
      seasonId = parseInt(options.season);
      episodeId = parseInt(options.episodeid);
      episode = App.request("episode:entity", episodeId);
      return App.execute("when:entity:fetched", episode, (function(_this) {
        return function() {
          _this.layout = _this.getLayoutView(episode);
          _this.listenTo(_this.layout, "show", function() {
            _this.getDetailsLayoutView(episode);
            return _this.getContentView(episode);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(episode) {
      return new Episode.PageLayout({
        model: episode
      });
    };

    Controller.prototype.getDetailsLayoutView = function(episode) {
      var headerLayout;
      headerLayout = new Episode.HeaderLayout({
        model: episode
      });
      this.listenTo(headerLayout, "show", (function(_this) {
        return function() {
          var detail, teaser;
          teaser = new Episode.EpisodeDetailTeaser({
            model: episode
          });
          detail = new Episode.Details({
            model: episode
          });
          API.bindTriggers(detail);
          headerLayout.regionSide.show(teaser);
          return headerLayout.regionMeta.show(detail);
        };
      })(this));
      return this.layout.regionHeader.show(headerLayout);
    };

    Controller.prototype.getContentView = function(episode) {
      this.contentLayout = new Episode.Content({
        model: episode
      });
      App.listenTo(this.contentLayout, 'show', (function(_this) {
        return function() {
          if (episode.get('cast').length > 0) {
            _this.contentLayout.regionCast.show(_this.getCast(episode));
          }
          return _this.getSeason(episode);
        };
      })(this));
      return this.layout.regionContent.show(this.contentLayout);
    };

    Controller.prototype.getCast = function(episode) {
      return App.request('cast:list:view', episode.get('cast'), 'tvshows');
    };

    Controller.prototype.getSeason = function(episode) {
      var collection;
      collection = App.request("episode:tvshow:entities", episode.get('tvshowid'), episode.get('season'));
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          var view;
          collection.sortCollection('episode', 'asc');
          view = App.request("episode:list:view", collection);
          return _this.contentLayout.regionSeason.show(view);
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
  return App.reqres.setHandler("episode:list:view", function(collection) {
    return API.getEpisodeList(collection);
  });
});

this.Kodi.module("TVShowApp.Episode", function(Episode, App, Backbone, Marionette, $, _) {
  Episode.EpisodeTeaser = (function(superClass) {
    extend(EpisodeTeaser, superClass);

    function EpisodeTeaser() {
      return EpisodeTeaser.__super__.constructor.apply(this, arguments);
    }

    EpisodeTeaser.prototype.triggers = {
      "click .play": "episode:play",
      "click .watched": "episode:watched",
      "click .add": "episode:add",
      "click .localplay": "episode:localplay",
      "click .download": "episode:download",
      "click .goto-season": "episode:goto:season",
      "click .edit": "episode:edit"
    };

    EpisodeTeaser.prototype.initialize = function() {
      EpisodeTeaser.__super__.initialize.apply(this, arguments);
      if (this.model != null) {
        this.setMeta();
        return this.model.set(App.request('episode:action:items'));
      }
    };

    EpisodeTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card');
    };

    EpisodeTeaser.prototype.setMeta = function() {
      var epNum, epNumFull, showLink, subTitleTip;
      epNum = this.themeTag('span', {
        "class": 'ep-num'
      }, this.model.escape('season') + 'x' + this.model.escape('episode') + ' ');
      epNumFull = this.themeTag('span', {
        "class": 'ep-num-full'
      }, t.gettext('Episode') + ' ' + this.model.escape('episode'));
      showLink = this.themeLink(this.model.escape('showtitle') + ' ', 'tvshow/' + this.model.escape('tvshowid'), {
        className: 'show-name'
      });
      subTitleTip = this.model.escape('firstaired') ? {
        title: tr('First aired') + ': ' + this.model.escape('firstaired')
      } : {};
      return this.model.set({
        labelHtml: epNum + this.model.get('title'),
        subtitleHtml: this.themeTag('div', subTitleTip, showLink + epNumFull)
      });
    };

    return EpisodeTeaser;

  })(App.Views.CardView);
  Episode.Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.prototype.tagName = "li";

    Empty.prototype.className = "episode-empty-result";

    return Empty;

  })(App.Views.EmptyViewResults);
  Episode.Episodes = (function(superClass) {
    extend(Episodes, superClass);

    function Episodes() {
      return Episodes.__super__.constructor.apply(this, arguments);
    }

    Episodes.prototype.childView = Episode.EpisodeTeaser;

    Episodes.prototype.emptyView = Episode.Empty;

    Episodes.prototype.tagName = "ul";

    Episodes.prototype.className = "card-grid--episode";

    return Episodes;

  })(App.Views.CollectionView);
  Episode.PageLayout = (function(superClass) {
    extend(PageLayout, superClass);

    function PageLayout() {
      return PageLayout.__super__.constructor.apply(this, arguments);
    }

    PageLayout.prototype.className = 'episode-show detail-container';

    return PageLayout;

  })(App.Views.LayoutWithHeaderView);
  Episode.HeaderLayout = (function(superClass) {
    extend(HeaderLayout, superClass);

    function HeaderLayout() {
      return HeaderLayout.__super__.constructor.apply(this, arguments);
    }

    HeaderLayout.prototype.className = 'episode-details';

    return HeaderLayout;

  })(App.Views.LayoutDetailsHeaderView);
  Episode.Details = (function(superClass) {
    extend(Details, superClass);

    function Details() {
      return Details.__super__.constructor.apply(this, arguments);
    }

    Details.prototype.template = 'apps/tvshow/episode/details_meta';

    Details.prototype.triggers = {
      'click .play': 'episode:play',
      'click .add': 'episode:add',
      'click .stream': 'episode:localplay',
      'click .download': 'episode:download',
      'click .edit': 'episode:edit',
      'click .refresh': 'episode:refresh'
    };

    Details.prototype.attributes = function() {
      return this.watchedAttributes();
    };

    return Details;

  })(App.Views.DetailsItem);
  Episode.EpisodeDetailTeaser = (function(superClass) {
    extend(EpisodeDetailTeaser, superClass);

    function EpisodeDetailTeaser() {
      return EpisodeDetailTeaser.__super__.constructor.apply(this, arguments);
    }

    EpisodeDetailTeaser.prototype.tagName = "div";

    EpisodeDetailTeaser.prototype.triggers = {
      "click .menu": "episode-menu:clicked"
    };

    EpisodeDetailTeaser.prototype.initialize = function() {
      return this.model.set({
        actions: {
          thumbs: tr('Thumbs up')
        }
      });
    };

    EpisodeDetailTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card-detail');
    };

    return EpisodeDetailTeaser;

  })(App.Views.CardView);
  return Episode.Content = (function(superClass) {
    extend(Content, superClass);

    function Content() {
      return Content.__super__.constructor.apply(this, arguments);
    }

    Content.prototype.template = 'apps/tvshow/episode/content';

    Content.prototype.className = "episode-content content-sections";

    Content.prototype.regions = {
      regionCast: '.region-cast',
      regionSeason: '.region-season'
    };

    Content.prototype.modelEvents = {
      'change': 'modelChange'
    };

    Content.prototype.modelChange = function() {
      this.render();
      return this.trigger('show');
    };

    return Content;

  })(App.Views.LayoutView);
});

this.Kodi.module("TVShowApp.List", function(List, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getTVShowsList: function(tvshows, set) {
      var view, viewName;
      if (set == null) {
        set = false;
      }
      viewName = set ? 'TVShowsSet' : 'TVShows';
      view = new List[viewName]({
        collection: tvshows
      });
      API.bindTriggers(view);
      return view;
    },
    bindTriggers: function(view) {
      App.listenTo(view, 'childview:tvshow:play', function(parent, viewItem) {
        return App.execute('tvshow:action', 'play', viewItem);
      });
      App.listenTo(view, 'childview:tvshow:add', function(parent, viewItem) {
        return App.execute('tvshow:action', 'add', viewItem);
      });
      App.listenTo(view, 'childview:tvshow:watched', function(parent, viewItem) {
        return App.execute('tvshow:action:watched', parent, viewItem);
      });
      return App.listenTo(view, 'childview:tvshow:edit', function(parent, viewItem) {
        return App.execute('tvshow:edit', viewItem.model);
      });
    }
  };
  List.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function() {
      var collection;
      collection = App.request("tvshow:entities");
      collection.availableFilters = this.getAvailableFilters();
      collection.sectionId = 'tvshows/recent';
      App.request('filter:init', this.getAvailableFilters());
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          _this.layout = _this.getLayoutView(collection);
          _this.listenTo(_this.layout, "show", function() {
            _this.getFiltersView(collection);
            return _this.renderList(collection);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(tvshows) {
      return new List.ListLayout({
        collection: tvshows
      });
    };

    Controller.prototype.getAvailableFilters = function() {
      return {
        sort: ['title', 'year', 'dateadded', 'rating', 'random'],
        filter: ['year', 'genre', 'unwatched', 'inprogress', 'cast', 'mpaa', 'studio', 'thumbsUp']
      };
    };

    Controller.prototype.getFiltersView = function(collection) {
      var filters;
      filters = App.request('filter:show', collection);
      this.layout.regionSidebarFirst.show(filters);
      return this.listenTo(filters, "filter:changed", (function(_this) {
        return function() {
          return _this.renderList(collection);
        };
      })(this));
    };

    Controller.prototype.renderList = function(collection) {
      var filteredCollection, view;
      App.execute("loading:show:view", this.layout.regionContent);
      filteredCollection = App.request('filter:apply:entities', collection);
      view = API.getTVShowsList(filteredCollection);
      return this.layout.regionContent.show(view);
    };

    return Controller;

  })(App.Controllers.Base);
  return App.reqres.setHandler("tvshow:list:view", function(collection) {
    return API.getTVShowsList(collection, true);
  });
});

this.Kodi.module("TVShowApp.List", function(List, App, Backbone, Marionette, $, _) {
  List.ListLayout = (function(superClass) {
    extend(ListLayout, superClass);

    function ListLayout() {
      return ListLayout.__super__.constructor.apply(this, arguments);
    }

    ListLayout.prototype.className = "tvshow-list with-filters";

    return ListLayout;

  })(App.Views.LayoutWithSidebarFirstView);
  List.TVShowTeaser = (function(superClass) {
    extend(TVShowTeaser, superClass);

    function TVShowTeaser() {
      return TVShowTeaser.__super__.constructor.apply(this, arguments);
    }

    TVShowTeaser.prototype.triggers = {
      "click .play": "tvshow:play",
      "click .watched": "tvshow:watched",
      "click .add": "tvshow:add",
      "click .edit": "tvshow:edit"
    };

    TVShowTeaser.prototype.initialize = function() {
      TVShowTeaser.__super__.initialize.apply(this, arguments);
      this.setMeta();
      return this.model.set(App.request('tvshow:action:items'));
    };

    TVShowTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card tv-show prevent-select');
    };

    TVShowTeaser.prototype.setMeta = function() {
      if (this.model) {
        return this.model.set({
          subtitle: this.model.get('rating')
        });
      }
    };

    return TVShowTeaser;

  })(App.Views.CardView);
  List.Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.prototype.tagName = "li";

    Empty.prototype.className = "tvshow-empty-result";

    return Empty;

  })(App.Views.EmptyViewResults);
  List.TVShows = (function(superClass) {
    extend(TVShows, superClass);

    function TVShows() {
      return TVShows.__super__.constructor.apply(this, arguments);
    }

    TVShows.prototype.childView = List.TVShowTeaser;

    TVShows.prototype.emptyView = List.Empty;

    TVShows.prototype.tagName = "ul";

    TVShows.prototype.className = "card-grid--tall";

    return TVShows;

  })(App.Views.VirtualListView);
  return List.TVShowsSet = (function(superClass) {
    extend(TVShowsSet, superClass);

    function TVShowsSet() {
      return TVShowsSet.__super__.constructor.apply(this, arguments);
    }

    TVShowsSet.prototype.childView = List.TVShowTeaser;

    TVShowsSet.prototype.emptyView = List.Empty;

    TVShowsSet.prototype.tagName = "ul";

    TVShowsSet.prototype.className = "card-grid--tall";

    return TVShowsSet;

  })(App.Views.CollectionView);
});

this.Kodi.module("TVShowApp.Season", function(Season, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    getSeasonList: function(collection) {
      var view;
      view = new Season.Seasons({
        collection: collection
      });
      return view;
    },
    bindTriggers: function(view) {
      App.listenTo(view, 'season:play', function(view) {
        return App.execute('tvshow:action', 'play', view);
      });
      App.listenTo(view, 'season:add', function(view) {
        return App.execute('tvshow:action', 'add', view);
      });
      return App.listenTo(view, 'toggle:watched', function(view) {
        return App.execute('tvshow:action:watched', view.view, view.view, true);
      });
    },
    mergeSeasonDetails: function(tvshow, season, seasons) {
      var attributes, len, mergeAttributes, n, prop;
      mergeAttributes = ['season', 'thumbnail', 'episode', 'unwatched', 'playcount', 'progress', 'watchedepisodes'];
      attributes = {
        seasons: seasons,
        type: 'season'
      };
      for (n = 0, len = mergeAttributes.length; n < len; n++) {
        prop = mergeAttributes[n];
        attributes[prop] = season.get(prop);
      }
      tvshow.set(attributes);
      return tvshow;
    }
  };
  Season.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var id, seasonId, tvshow;
      id = parseInt(options.id);
      seasonId = parseInt(options.season);
      tvshow = App.request("tvshow:entity", id);
      return App.execute("when:entity:fetched", tvshow, (function(_this) {
        return function() {
          var seasons;
          seasons = App.request("season:entities", tvshow.get('id'));
          return App.execute("when:entity:fetched", seasons, function() {
            var season;
            season = seasons.findWhere({
              season: seasonId
            });
            tvshow = API.mergeSeasonDetails(tvshow, season, seasons);
            _this.layout = _this.getLayoutView(tvshow);
            _this.listenTo(_this.layout, "show", function() {
              _this.getDetailsLayoutView(tvshow);
              return _this.getEpisodes(tvshow, seasonId);
            });
            return App.regionContent.show(_this.layout);
          });
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(tvshow) {
      return new Season.PageLayout({
        model: tvshow
      });
    };

    Controller.prototype.getDetailsLayoutView = function(tvshow) {
      var headerLayout;
      headerLayout = new Season.HeaderLayout({
        model: tvshow
      });
      this.listenTo(headerLayout, "show", (function(_this) {
        return function() {
          var detail, teaser;
          teaser = new Season.SeasonDetailTeaser({
            model: tvshow
          });
          detail = new Season.Details({
            model: tvshow
          });
          API.bindTriggers(detail);
          headerLayout.regionSide.show(teaser);
          return headerLayout.regionMeta.show(detail);
        };
      })(this));
      return this.layout.regionHeader.show(headerLayout);
    };

    Controller.prototype.getEpisodes = function(tvshow, seasonId) {
      var collection;
      collection = App.request("episode:tvshow:entities", tvshow.get('tvshowid'), seasonId);
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          var view;
          collection.sortCollection('episode', 'asc');
          view = App.request("episode:list:view", collection);
          return _this.layout.regionContent.show(view);
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
  return App.reqres.setHandler("season:list:view", function(collection) {
    return API.getSeasonList(collection);
  });
});

this.Kodi.module("TVShowApp.Season", function(Season, App, Backbone, Marionette, $, _) {
  Season.SeasonTeaser = (function(superClass) {
    extend(SeasonTeaser, superClass);

    function SeasonTeaser() {
      return SeasonTeaser.__super__.constructor.apply(this, arguments);
    }

    SeasonTeaser.prototype.triggers = {
      "click .play": "season:play",
      "click .watched": "season:watched",
      "click .add": "season:add"
    };

    SeasonTeaser.prototype.initialize = function() {
      var subtitle;
      SeasonTeaser.__super__.initialize.apply(this, arguments);
      subtitle = this.model.get('episode') + ' ' + tr('episodes');
      this.model.set({
        subtitle: subtitle
      });
      this.model.set(App.request('tvshow:action:items'));
      return this.model.set({
        label: tr('Season') + ' ' + this.model.get('season')
      });
    };

    SeasonTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card tv-season prevent-select');
    };

    return SeasonTeaser;

  })(App.Views.CardView);
  Season.Empty = (function(superClass) {
    extend(Empty, superClass);

    function Empty() {
      return Empty.__super__.constructor.apply(this, arguments);
    }

    Empty.prototype.tagName = "li";

    Empty.prototype.className = "season-empty-result";

    return Empty;

  })(App.Views.EmptyViewResults);
  Season.Seasons = (function(superClass) {
    extend(Seasons, superClass);

    function Seasons() {
      return Seasons.__super__.constructor.apply(this, arguments);
    }

    Seasons.prototype.childView = Season.SeasonTeaser;

    Seasons.prototype.emptyView = Season.Empty;

    Seasons.prototype.tagName = "ul";

    Seasons.prototype.className = "card-grid--tall";

    return Seasons;

  })(App.Views.CollectionView);
  Season.PageLayout = (function(superClass) {
    extend(PageLayout, superClass);

    function PageLayout() {
      return PageLayout.__super__.constructor.apply(this, arguments);
    }

    PageLayout.prototype.className = 'season-show tv-collection detail-container';

    return PageLayout;

  })(App.Views.LayoutWithHeaderView);
  Season.HeaderLayout = (function(superClass) {
    extend(HeaderLayout, superClass);

    function HeaderLayout() {
      return HeaderLayout.__super__.constructor.apply(this, arguments);
    }

    HeaderLayout.prototype.className = 'season-details';

    return HeaderLayout;

  })(App.Views.LayoutDetailsHeaderView);
  Season.Details = (function(superClass) {
    extend(Details, superClass);

    function Details() {
      return Details.__super__.constructor.apply(this, arguments);
    }

    Details.prototype.template = 'apps/tvshow/season/details_meta';

    Details.prototype.triggers = {
      "click .play": "season:play",
      "click .add": "season:add"
    };

    Details.prototype.attributes = function() {
      return this.watchedAttributes('details-meta');
    };

    return Details;

  })(App.Views.DetailsItem);
  return Season.SeasonDetailTeaser = (function(superClass) {
    extend(SeasonDetailTeaser, superClass);

    function SeasonDetailTeaser() {
      return SeasonDetailTeaser.__super__.constructor.apply(this, arguments);
    }

    SeasonDetailTeaser.prototype.tagName = "div";

    SeasonDetailTeaser.prototype.className = "card-detail";

    return SeasonDetailTeaser;

  })(App.Views.CardView);
});

this.Kodi.module("TVShowApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    bindTriggersTVShow: function(view) {
      App.listenTo(view, 'tvshow:play', function(view) {
        return App.execute('tvshow:action', 'play', view);
      });
      App.listenTo(view, 'tvshow:add', function(view) {
        return App.execute('tvshow:action', 'add', view);
      });
      App.listenTo(view, 'toggle:watched', function(view) {
        return App.execute('tvshow:action:watched', view.view, view.view, true);
      });
      App.listenTo(view, 'tvshow:refresh', function(view) {
        return App.execute('tvshow:action', 'refresh', view);
      });
      App.listenTo(view, 'tvshow:refresh:episodes', function(view) {
        return App.execute('tvshow:action', 'refreshEpisodes', view);
      });
      return App.listenTo(view, 'tvshow:edit', function(view) {
        return App.execute('tvshow:edit', view.model);
      });
    },
    bindTriggersTVSeason: function(view) {
      App.listenTo(view, 'childview:season:play', function(parent, viewItem) {
        return App.execute('tvshow:action', 'play', viewItem);
      });
      App.listenTo(view, 'childview:season:add', function(parent, viewItem) {
        return App.execute('tvshow:action', 'add', viewItem);
      });
      return App.listenTo(view, 'childview:season:watched', function(parent, viewItem) {
        return App.execute('tvshow:action:watched', parent, viewItem, false);
      });
    }
  };
  return Show.Controller = (function(superClass) {
    extend(Controller, superClass);

    function Controller() {
      return Controller.__super__.constructor.apply(this, arguments);
    }

    Controller.prototype.initialize = function(options) {
      var id, tvshow;
      id = parseInt(options.id);
      tvshow = App.request("tvshow:entity", id);
      return App.execute("when:entity:fetched", tvshow, (function(_this) {
        return function() {
          _this.layout = _this.getLayoutView(tvshow);
          _this.listenTo(_this.layout, "destroy", function() {
            return App.execute("images:fanart:set", 'none');
          });
          _this.listenTo(_this.layout, "show", function() {
            _this.getDetailsLayoutView(tvshow);
            return _this.getSeasons(tvshow);
          });
          return App.regionContent.show(_this.layout);
        };
      })(this));
    };

    Controller.prototype.getLayoutView = function(tvshow) {
      return new Show.PageLayout({
        model: tvshow
      });
    };

    Controller.prototype.getDetailsLayoutView = function(tvshow) {
      var headerLayout;
      headerLayout = new Show.HeaderLayout({
        model: tvshow
      });
      this.listenTo(headerLayout, "show", (function(_this) {
        return function() {
          var detail, teaser;
          teaser = new Show.TVShowTeaser({
            model: tvshow
          });
          detail = new Show.Details({
            model: tvshow
          });
          API.bindTriggersTVShow(detail);
          API.bindTriggersTVShow(teaser);
          headerLayout.regionSide.show(teaser);
          return headerLayout.regionMeta.show(detail);
        };
      })(this));
      return this.layout.regionHeader.show(headerLayout);
    };

    Controller.prototype.getSeasons = function(tvshow) {
      var collection;
      collection = App.request("season:entities", tvshow.get('tvshowid'));
      return App.execute("when:entity:fetched", collection, (function(_this) {
        return function() {
          var view;
          view = App.request("season:list:view", collection);
          API.bindTriggersTVSeason(view);
          if (_this.layout.regionContent) {
            _this.layout.regionContent.show(view);
            return App.vent.on('entity:kodi:update', function(uid) {
              if (tvshow.get('uid') === uid) {
                return _this.getSeasons(tvshow);
              }
            });
          }
        };
      })(this));
    };

    return Controller;

  })(App.Controllers.Base);
});

this.Kodi.module("TVShowApp.Show", function(Show, App, Backbone, Marionette, $, _) {
  Show.PageLayout = (function(superClass) {
    extend(PageLayout, superClass);

    function PageLayout() {
      return PageLayout.__super__.constructor.apply(this, arguments);
    }

    PageLayout.prototype.className = 'tvshow-show tv-collection detail-container';

    return PageLayout;

  })(App.Views.LayoutWithHeaderView);
  Show.HeaderLayout = (function(superClass) {
    extend(HeaderLayout, superClass);

    function HeaderLayout() {
      return HeaderLayout.__super__.constructor.apply(this, arguments);
    }

    HeaderLayout.prototype.className = 'tvshow-details';

    return HeaderLayout;

  })(App.Views.LayoutDetailsHeaderView);
  Show.Details = (function(superClass) {
    extend(Details, superClass);

    function Details() {
      return Details.__super__.constructor.apply(this, arguments);
    }

    Details.prototype.template = 'apps/tvshow/show/details_meta';

    Details.prototype.triggers = {
      "click .play": "tvshow:play",
      "click .add": "tvshow:add",
      "click .edit": "tvshow:edit",
      "click .refresh": "tvshow:refresh",
      "click .refresh-episodes": "tvshow:refresh:episodes"
    };

    Details.prototype.attributes = function() {
      return this.watchedAttributes('details-meta');
    };

    return Details;

  })(App.Views.DetailsItem);
  return Show.TVShowTeaser = (function(superClass) {
    extend(TVShowTeaser, superClass);

    function TVShowTeaser() {
      return TVShowTeaser.__super__.constructor.apply(this, arguments);
    }

    TVShowTeaser.prototype.tagName = "div";

    TVShowTeaser.prototype.triggers = {
      "click .play": "tvshow:play"
    };

    TVShowTeaser.prototype.initialize = function() {
      return this.model.set({
        actions: {
          thumbs: tr('Thumbs up')
        }
      });
    };

    TVShowTeaser.prototype.attributes = function() {
      return this.watchedAttributes('card-detail');
    };

    return TVShowTeaser;

  })(App.Views.CardView);
});

this.Kodi.module("TVShowApp", function(TVShowApp, App, Backbone, Marionette, $, _) {
  var API;
  TVShowApp.Router = (function(superClass) {
    extend(Router, superClass);

    function Router() {
      return Router.__super__.constructor.apply(this, arguments);
    }

    Router.prototype.appRoutes = {
      "tvshows": "list",
      "tvshow/:tvshowid": "view",
      "tvshow/:tvshowid/:season": "season",
      "tvshow/:tvshowid/:season/:episodeid": "episode"
    };

    return Router;

  })(App.Router.Base);
  API = {
    list: function() {
      return new TVShowApp.List.Controller();
    },
    view: function(tvshowid) {
      return new TVShowApp.Show.Controller({
        id: tvshowid
      });
    },
    season: function(tvshowid, season) {
      return new TVShowApp.Season.Controller({
        id: tvshowid,
        season: season
      });
    },
    episode: function(tvshowid, season, episodeid) {
      return new TVShowApp.Episode.Controller({
        id: tvshowid,
        season: season,
        episodeid: episodeid
      });
    },
    toggleWatched: function(model, season, op) {
      if (season == null) {
        season = 'all';
      }
      return API.getAllEpisodesCollection(model.get('tvshowid'), season, function(collection) {
        var videoLib;
        videoLib = App.request("command:kodi:controller", 'video', 'VideoLibrary');
        return videoLib.toggleWatchedCollection(collection, op);
      });
    },
    toggleWatchedUiState: function($el, setChildren) {
      var $layout, classOp, op, progress, unwatched;
      if (setChildren == null) {
        setChildren = true;
      }
      op = $el.hasClass('is-watched') ? 'unwatched' : 'watched';
      classOp = op === 'watched' ? 'addClass' : 'removeClass';
      progress = op === 'watched' ? 100 : 0;
      $el[classOp]('is-watched');
      helpers.entities.setProgress($el, progress);
      $layout = $el.closest('.tv-collection');
      if (setChildren) {
        $layout.find('.region-content .card')[classOp]('is-watched');
        helpers.entities.setProgress($layout, progress);
      }
      unwatched = parseInt($layout.find('.episode-total').text()) - $layout.find('.region-content .is-watched').length;
      $layout.find('.episode-unwatched').text(unwatched);
      return $layout;
    },
    getAllEpisodesCollection: function(tvshowid, season, callback) {
      var collectionAll;
      collectionAll = App.request("episode:tvshow:entities", tvshowid, season);
      return App.execute("when:entity:fetched", collectionAll, (function(_this) {
        return function() {
          return callback(collectionAll);
        };
      })(this));
    },
    episodeAction: function(op, view) {
      var files, model, playlist, videoLib;
      model = view.model;
      playlist = App.request("command:kodi:controller", 'video', 'PlayList');
      files = App.request("command:kodi:controller", 'video', 'Files');
      videoLib = App.request("command:kodi:controller", 'video', 'VideoLibrary');
      switch (op) {
        case 'play':
          return App.execute("input:resume", model, 'episodeid');
        case 'add':
          return playlist.add('episodeid', model.get('episodeid'));
        case 'localplay':
          return files.videoStream(model.get('file'), model.get('fanart'));
        case 'download':
          return files.downloadFile(model.get('file'));
        case 'toggleWatched':
          return videoLib.toggleWatched(model, 'auto');
        case 'gotoSeason':
          return App.navigate("#tvshow/" + model.get('tvshowid') + '/' + model.get('season'), {
            trigger: true
          });
        case 'refresh':
          return helpers.entities.refreshEntity(model, videoLib, 'refreshEpisode');
      }
    },
    tvShowAction: function(op, view) {
      var model, playlist, season, videoLib;
      model = view.model;
      playlist = App.request("command:kodi:controller", 'video', 'PlayList');
      season = model.get('type') === 'season' ? model.get('season') : 'all';
      videoLib = App.request("command:kodi:controller", 'video', 'VideoLibrary');
      switch (op) {
        case 'play':
          return API.getAllEpisodesCollection(model.get('tvshowid'), season, function(collection) {
            return playlist.playCollection(collection);
          });
        case 'add':
          return API.getAllEpisodesCollection(model.get('tvshowid'), season, function(collection) {
            return playlist.addCollection(collection);
          });
        case 'watched':
          return API.toggleWatched(model, season, op);
        case 'unwatched':
          return API.toggleWatched(model, season, op);
        case 'edit':
          return App.execute('tvshow:edit', model);
        case 'refresh':
          return helpers.entities.refreshEntity(model, videoLib, 'refreshTVShow');
        case 'refreshEpisodes':
          return helpers.entities.refreshEntity(model, videoLib, 'refreshTVShow', {
            refreshepisodes: true
          });
      }
    }
  };
  App.commands.setHandler('episode:action', function(op, view) {
    return API.episodeAction(op, view);
  });
  App.commands.setHandler('tvshow:action', function(op, view) {
    return API.tvShowAction(op, view);
  });
  App.reqres.setHandler('episode:action:items', function() {
    return {
      actions: {
        watched: tr('Watched'),
        thumbs: tr('Thumbs up')
      },
      menu: {
        'add': tr('Queue in Kodi'),
        'divider-1': '',
        'download': tr('Download'),
        'localplay': tr('Play in browser'),
        'divider-2': '',
        'goto-season': tr('Go to season'),
        'divider-3': '',
        'edit': tr('Edit')
      }
    };
  });
  App.reqres.setHandler('tvshow:action:items', function() {
    return {
      actions: {
        watched: tr('Watched'),
        thumbs: tr('Thumbs up')
      },
      menu: {
        add: tr('Queue in Kodi'),
        'divider-': '',
        'edit': tr('Edit')
      }
    };
  });
  App.commands.setHandler('tvshow:action:watched', function(parent, viewItem, setChildren) {
    var msg, op;
    if (setChildren == null) {
      setChildren = false;
    }
    op = parent.$el.hasClass('is-watched') ? 'unwatched' : 'watched';
    if (viewItem.model.get('type') === 'season') {
      msg = tr('Set all episodes for this season as') + ' ' + tr(op);
    } else {
      msg = tr('Set all episodes for this TV show as') + ' ' + tr(op);
    }
    return App.execute("ui:modal:confirm", tr('Are you sure?'), msg, function() {
      API.toggleWatchedUiState(parent.$el, setChildren);
      return API.tvShowAction(op, viewItem);
    });
  });
  App.commands.setHandler('episode:action:watched', function(parent, viewItem) {
    API.toggleWatchedUiState(parent.$el, false);
    return API.episodeAction('toggleWatched', viewItem);
  });
  App.commands.setHandler('tvshow:edit', function(model) {
    var loadedModel;
    loadedModel = App.request("tvshow:entity", model.get('id'));
    return App.execute("when:entity:fetched", loadedModel, (function(_this) {
      return function() {
        return new TVShowApp.EditShow.Controller({
          model: loadedModel
        });
      };
    })(this));
  });
  App.commands.setHandler('episode:edit', function(model) {
    var loadedModel;
    loadedModel = App.request("episode:entity", model.get('id'));
    return App.execute("when:entity:fetched", loadedModel, (function(_this) {
      return function() {
        return new TVShowApp.EditEpisode.Controller({
          model: loadedModel
        });
      };
    })(this));
  });
  return App.on("before:start", function() {
    return new TVShowApp.Router({
      controller: API
    });
  });
});

this.Kodi.module("UiApp", function(UiApp, App, Backbone, Marionette, $, _) {
  var API;
  API = {
    openModal: function(titleHtml, msgHtml, open, style) {
      var $body, $modal, $title;
      if (open == null) {
        open = true;
      }
      if (style == null) {
        style = '';
      }
      $title = App.getRegion('regionModalTitle').$el;
      $body = App.getRegion('regionModalBody').$el;
      $modal = App.getRegion('regionModal').$el;
      $modal.removeClassStartsWith('style-');
      $modal.addClass('style-' + style);
      $title.html(titleHtml);
      $body.html(msgHtml);
      if (open) {
        $modal.modal();
      }
      $modal.on('hidden.bs.modal', function(e) {
        return $body.html('');
      });
      return $modal;
    },
    closeModal: function() {
      App.getRegion('regionModal').$el.modal('hide');
      return $('.modal-body').html('');
    },
    closeModalButton: function(text) {
      if (text == null) {
        text = 'close';
      }
      return API.getButton(t.gettext(text), 'default').on('click', function() {
        return API.closeModal();
      });
    },
    getModalButtonContainer: function() {
      return App.getRegion('regionModalFooter').$el.empty();
    },
    getButton: function(text, type) {
      if (type == null) {
        type = 'primary';
      }
      return $('<button>').addClass('btn btn-' + type).text(text);
    },
    defaultButtons: function(callback) {
      var $ok;
      $ok = API.getButton(t.gettext('ok'), 'primary').on('click', function() {
        if (callback) {
          callback();
        }
        return API.closeModal();
      });
      return API.getModalButtonContainer().append(API.closeModalButton()).append($ok);
    },
    confirmButtons: function(callback) {
      var $ok;
      $ok = API.getButton(t.gettext('yes'), 'primary').on('click', function() {
        if (callback) {
          callback();
        }
        return API.closeModal();
      });
      return API.getModalButtonContainer().append(API.closeModalButton('no')).append($ok);
    },
    playerMenu: function(op) {
      var $el, openClass;
      if (op == null) {
        op = 'toggle';
      }
      $el = $('.player-menu-wrapper');
      openClass = 'opened';
      switch (op) {
        case 'open':
          return $el.addClass(openClass);
        case 'close':
          return $el.removeClass(openClass);
        default:
          return $el.toggleClass(openClass);
      }
    },
    buildOptions: function(options) {
      var $newOption, $option, $wrap, len, n, option;
      if (options.length === 0) {
        return;
      }
      $wrap = $('<ul>').addClass('modal-options options-list');
      $option = $('<li>');
      for (n = 0, len = options.length; n < len; n++) {
        option = options[n];
        $newOption = $option.clone();
        $newOption.html(option);
        $newOption.click(function(e) {
          API.closeModal();
          return $(this).closest('ul').find('li, span').unbind('click');
        });
        $wrap.append($newOption);
      }
      return $wrap;
    }
  };
  App.commands.setHandler("ui:textinput:show", function(title, options, callback) {
    var $input, $msg, el, msg, open, val;
    if (options == null) {
      options = {};
    }
    msg = options.msg ? options.msg : '';
    open = options.open ? true : false;
    val = options.defaultVal ? options.defaultVal : '';
    $input = $('<input>', {
      id: 'text-input',
      "class": 'form-control',
      type: 'text',
      value: val
    }).on('keyup', function(e) {
      if (e.keyCode === 13 && callback) {
        callback($('#text-input').val());
        return API.closeModal();
      }
    });
    $msg = $('<p>').text(msg);
    API.defaultButtons(function() {
      return callback($('#text-input').val());
    });
    API.openModal(title, $msg, callback, open);
    el = App.getRegion('regionModalBody').$el.append($input.wrap('<div class="form-control-wrapper"></div>'));
    setTimeout(function() {
      return el.find('input').first().focus();
    }, 200);
    return $.material.init();
  });
  App.commands.setHandler("ui:modal:close", function() {
    return API.closeModal();
  });
  App.commands.setHandler("ui:modal:confirm", function(titleHtml, msgHtml, callback) {
    if (msgHtml == null) {
      msgHtml = '';
    }
    API.confirmButtons(function() {
      return callback(true);
    });
    return API.openModal(titleHtml, msgHtml, true, 'confirm');
  });
  App.commands.setHandler("ui:modal:show", function(titleHtml, msgHtml, footerHtml, closeButton, style) {
    if (msgHtml == null) {
      msgHtml = '';
    }
    if (footerHtml == null) {
      footerHtml = '';
    }
    if (closeButton == null) {
      closeButton = false;
    }
    if (style == null) {
      style = '';
    }
    API.getModalButtonContainer().html(footerHtml);
    if (closeButton) {
      API.getModalButtonContainer().prepend(API.closeModalButton());
    }
    return API.openModal(titleHtml, msgHtml, true, style);
  });
  App.commands.setHandler("ui:modal:form:show", function(titleHtml, msgHtml, style) {
    if (msgHtml == null) {
      msgHtml = '';
    }
    if (style == null) {
      style = 'form';
    }
    return API.openModal(titleHtml, msgHtml, true, style);
  });
  App.commands.setHandler("ui:modal:close", function() {
    return API.closeModal();
  });
  App.commands.setHandler("ui:modal:youtube", function(titleHtml, videoid) {
    var msgHtml;
    API.getModalButtonContainer().html('');
    msgHtml = '<iframe width="560" height="315" src="https://www.youtube.com/embed/' + videoid + '?rel=0&amp;showinfo=0&amp;autoplay=1" frameborder="0" allowfullscreen></iframe>';
    return API.openModal(titleHtml, msgHtml, true, 'video');
  });
  App.commands.setHandler("ui:modal:options", function(titleHtml, items) {
    var $options;
    $options = API.buildOptions(items);
    return API.openModal(titleHtml, $options, true, 'options');
  });
  App.commands.setHandler("ui:playermenu", function(op) {
    return API.playerMenu(op);
  });
  App.commands.setHandler("ui:dropdown:bind:close", function($el) {
    return $el.on("click", '.dropdown-menu li, .dropdown-menu a', function(e) {
      return $(e.target).closest('.dropdown-menu').parent().removeClass('open').trigger('hide.bs.dropdown');
    });
  });
  return App.vent.on("shell:ready", (function(_this) {
    return function(options) {
      return $('html').on('click', function() {
        return API.playerMenu('close');
      });
    };
  })(this));
});
