window.JST["apps/album/show/tpl/album_with_songs.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="album album--with-songs">\n    <div class="region-album-side">\n        <div class="region-album-meta"></div>\n    </div>\n    <div class="region-album-content">\n        <div class="region-album-songs"></div>\n    </div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/album/show/tpl/details_meta.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="region-details-top">\n    <div class="region-details-title">\n        <h2><span class="title">'));
    
      _print(this.label);
    
      _print(_safe('</span> <span class="sub"><a href="#music/albums?year='));
    
      _print(this.year);
    
      _print(_safe('">'));
    
      _print(this.year);
    
      _print(_safe('</a></span></h2>\n    </div>\n    '));
    
      if (this.rating) {
        _print(_safe('\n    <div class="region-details-rating">\n        '));
        _print(this.rating);
        _print(_safe(' <i></i>\n    </div>\n    '));
      }
    
      _print(_safe('\n</div>\n\n<div class="region-details-meta-below">\n\n    <ul class="meta">\n        '));
    
      if (this.artist) {
        _print(_safe('\n            <li><label>'));
        _print(tr("artist"));
        _print(_safe(':</label> <span><a href="#music/artist/'));
        _print(this.artistid);
        _print(_safe('">'));
        _print(this.artist);
        _print(_safe('</a></span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.genre.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("genre", "genres", this.genre.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('music/albums', 'genre', this.genre)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.style.length) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("style", "styles", this.style.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('music/albums', 'style', this.style)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.albumlabel) {
        _print(_safe('\n            <li><label>'));
        _print(tr("label"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('music/albums', 'albumlabel', [this.albumlabel])));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n    </ul>\n\n    <div class="description">'));
    
      _print(this.description);
    
      _print(_safe('</div>\n\n    <ul class="inline-links">\n        <li class="btn-flat-play play">'));
    
      _print(tr('Play'));
    
      _print(_safe('</li>\n        <li class="btn-flat-add add">'));
    
      _print(tr('Queue'));
    
      _print(_safe('</li>\n        <li class="btn-flat-stream localplay">'));
    
      _print(tr('Stream'));
    
      _print(_safe('</li>\n        <li class="more-actions dropdown">\n            <span class="btn-flat-more" data-toggle="dropdown" aria-expanded="true">'));
    
      _print(tr('more'));
    
      _print(_safe('</span>\n            <ul class="dropdown-menu pull-right">\n                <li class="localadd">'));
    
      _print(tr('Add to playlist'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="dropdown-submenu internal-search">'));
    
      _print(tr('Chorus Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        '));
    
      _print(_safe(helpers.entities.getAddonSearchMenuItems(this.label)));
    
      _print(_safe('\n                    </ul>\n                </li>\n                <li class="dropdown-submenu external-search">'));
    
      _print(tr('External Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        <li data-type="google" data-query="'));
    
      _print(this.artist);
    
      _print(_safe(' '));
    
      _print(this.label);
    
      _print(_safe('">Google</li>\n                        <li data-type="soundcloud" data-query="'));
    
      _print(this.artist);
    
      _print(_safe('">SoundCloud</li>\n                    </ul>\n                </li>\n                <li class="youtube-search" data-query="'));
    
      _print(this.artist);
    
      _print(_safe(' '));
    
      _print(this.label);
    
      _print(_safe('">'));
    
      _print(tr('YouTube Search'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="edit">'));
    
      _print(tr('Edit'));
    
      _print(_safe('</li>\n            </ul>\n        </li>\n    </ul>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/artist/show/tpl/details_meta.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="region-details-top">\n    <div class="region-details-title">\n        <h2>'));
    
      _print(this.label);
    
      _print(_safe('</h2>\n    </div>\n</div>\n\n<div class="region-details-meta-below">\n\n    <ul class="meta">\n        '));
    
      if (this.genre.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("genre", "genres", this.genre.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('music/artists', 'genre', this.genre)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.style.length) {
        _print(_safe('\n        <li><label>'));
        _print(t.ngettext("style", "styles", this.style.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('music/artists', 'style', this.style)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.formed) {
        _print(_safe('\n            <li><label>'));
        _print(tr("formed"));
        _print(_safe(':</label> <span>'));
        _print(this.formed);
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.yearsactive && this.yearsactive.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(tr("years active"));
        _print(_safe(':</label> <span>'));
        _print(this.yearsactive);
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.born) {
        _print(_safe('\n            <li><label>'));
        _print(tr("born"));
        _print(_safe(':</label> <span>'));
        _print(this.born);
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.died) {
        _print(_safe('\n            <li><label>'));
        _print(tr("died"));
        _print(_safe(':</label> <span>'));
        _print(this.died);
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.disbanded) {
        _print(_safe('\n            <li><label>'));
        _print(tr("disbanded"));
        _print(_safe(':</label> <span>'));
        _print(this.disbanded);
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n    </ul>\n\n    <div class="description">'));
    
      _print(this.description);
    
      _print(_safe('</div>\n\n    <ul class="inline-links">\n        <li class="btn-flat-play play">'));
    
      _print(tr('Play'));
    
      _print(_safe('</li>\n        <li class="btn-flat-add add">'));
    
      _print(tr('Queue'));
    
      _print(_safe('</li>\n        <li class="btn-flat-stream localplay">'));
    
      _print(tr('Stream'));
    
      _print(_safe('</li>\n        <li class="more-actions dropdown">\n            <span class="btn-flat-more" data-toggle="dropdown" aria-expanded="true">'));
    
      _print(tr('more'));
    
      _print(_safe('</span>\n            <ul class="dropdown-menu pull-right">\n                <li class="localadd">'));
    
      _print(tr('Add to playlist'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="dropdown-submenu internal-search">'));
    
      _print(tr('Chorus Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        '));
    
      _print(_safe(helpers.entities.getAddonSearchMenuItems(this.label)));
    
      _print(_safe('\n                    </ul>\n                </li>\n                <li class="dropdown-submenu external-search">'));
    
      _print(tr('External Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        <li data-type="google" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">Google</li>\n                        <li data-type="soundcloud" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">SoundCloud</li>\n                    </ul>\n                </li>\n                <li class="youtube-search" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">'));
    
      _print(tr('YouTube Search'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="edit">'));
    
      _print(tr('Edit'));
    
      _print(_safe('</li>\n            </ul>\n        </li>\n    </ul>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/browser/list/tpl/back_button.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<i class="mdi thumb"></i><div class="title">'));
    
      _print(t.gettext('Back'));
    
      _print(_safe('</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/browser/list/tpl/file.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="thumb" style="background-image: url(\''));
    
      _print(this.thumbnail);
    
      _print(_safe('\')"><div class="mdi play"></div></div>\n<div class="title" title="'));
    
      _print(helpers.global.stripTags(this.labelHtml));
    
      _print(_safe('">'));
    
      _print(_safe(this.labelHtml));
    
      _print(_safe('</div>\n<ul class="actions">\n    <li class="menu dropdown">\n        <i data-toggle="dropdown" class="mdi"></i>\n        <ul class="dropdown-menu pull-right"></ul>\n    </li>\n</ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/browser/list/tpl/folder_layout.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="folder-layout">\n    <div class="loading-bar"><div class="inner"><div class="loader-small-inline"></div> <span>'));
    
      _print(tr('Loading folder...'));
    
      _print(_safe('</span></div></div>\n    <div class="path"></div>\n    <ul class="actions">\n        <li class="dropdown sort-wrapper">\n            <i class="sort-toggle" data-toggle="dropdown" title="'));
    
      _print(tr('Sort'));
    
      _print(_safe('"></i>\n            <ul class="sorts dropdown-menu pull-right">\n                <li data-sort="none">'));
    
      _print(tr('default'));
    
      _print(_safe('<i></i></li>\n                <li data-sort="label">'));
    
      _print(tr('title'));
    
      _print(_safe('<i></i></li>\n                <li data-sort="dateadded">'));
    
      _print(tr('date added'));
    
      _print(_safe('<i></i></li>\n                <li data-sort="random">'));
    
      _print(tr('random'));
    
      _print(_safe('<i></i></li>\n            </ul>\n        </li>\n        <li class="dropdown context-wrapper">\n            <i class="context-toggle" data-toggle="dropdown" title="'));
    
      _print(tr('Actions'));
    
      _print(_safe('"></i>\n            <ul class="dropdown-menu pull-right">\n                <li class="play">'));
    
      _print(tr('play files'));
    
      _print(_safe('<i></i></li>\n                <li class="queue">'));
    
      _print(tr('queue files'));
    
      _print(_safe('<i></i></li>\n            </ul>\n        </li>\n    </ul>\n\n\n    <div class="folder-container">\n        <div class="files">\n        </div>\n        <div class="folders-pane">\n            <div class="back"></div>\n            <div class="folders">\n                <div class="intro">\n                    <h3><span class="mdi-navigation-arrow-back text-dim"></span> '));
    
      _print(tr('Browse files and add-ons'));
    
      _print(_safe('</h3>\n                    <p>'));
    
      _print(tr('This is where you can browse all Kodi content, not just what is in the library. Browse by source or add-on.'));
    
      _print(_safe('</p>\n                </div>\n            </div>\n        </div>\n    </div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/browser/list/tpl/path.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="title">'));
    
      _print(this.label);
    
      _print(_safe('</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/browser/list/tpl/source.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="source source-'));
    
      _print(this.media);
    
      _print(_safe('">\n    '));
    
      _print(this.label);
    
      _print(_safe('\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/browser/list/tpl/source_set.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<h3>'));
    
      _print(this.label);
    
      _print(_safe('</h3>\n<ul class="sources"></ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/cast/list/tpl/cast.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<a href="#'));
    
      _print(this.origin);
    
      _print(_safe('?cast='));
    
      _print(this.name);
    
      _print(_safe('" title="'));
    
      _print(this.name);
    
      _print(_safe(' ('));
    
      _print(this.role);
    
      _print(_safe(')">\n    <div class="thumb">\n        <img src="'));
    
      _print(this.thumbnail);
    
      _print(_safe('" />\n    </div>\n    <div class="meta">\n        <strong>'));
    
      _print(this.name);
    
      _print(_safe('</strong>\n        <span title="'));
    
      _print(this.role);
    
      _print(_safe('">'));
    
      _print(this.role);
    
      _print(_safe('</span>\n    </div>\n</a>\n<ul class="actions">\n    <li class="imdb" title="IMDb search '));
    
      _print(this.name);
    
      _print(_safe('"></li>\n    <li class="google" title="Google search '));
    
      _print(this.name);
    
      _print(_safe('"></li>\n</ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/category/list/tpl/item.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<a href="#'));
    
      _print(this.url);
    
      _print(_safe('">\n    <span>'));
    
      _print(this.title);
    
      _print(_safe('</span>\n</a>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/epg/list/tpl/channel.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<h3>'));
    
      _print(this.channel);
    
      _print(_safe('</h3>\n<ul class="items">\n    <li class="play">'));
    
      _print(tr('Play'));
    
      _print(_safe('</li>\n    <li class="record">'));
    
      _print(tr('Record'));
    
      _print(_safe('</li>\n</ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/epg/list/tpl/programme.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="title">\n    <strong>'));
    
      _print(this.label);
    
      _print(_safe('</strong>\n</div>\n<div class="date">\n    '));
    
      _print(this.start.toString('h:mmtt').toLowerCase());
    
      _print(_safe(' - '));
    
      _print(this.end.toString('h:mmtt').toLowerCase());
    
      _print(_safe(' ('));
    
      _print(this.runtime);
    
      _print(_safe('min)<br />\n    '));
    
      _print(this.start.toString('dddd, dS MMM'));
    
      _print(_safe('\n</div>\n<div class="plot">'));
    
      _print(this.plot);
    
      _print(_safe('</div>\n<div class="entity-progress">\n    <div class="current-progress" style="width: '));
    
      _print(this.progresspercentage);
    
      _print(_safe('%" title="'));
    
      _print(Math.round(this.progresspercentage));
    
      _print(_safe('% '));
    
      _print(tr('complete'));
    
      _print(_safe('"></div>\n</div>\n<ul class="actions">\n    '));
    
      if (this.isactive) {
        _print(_safe('\n        <li class="play" title="'));
        _print(tr('Play'));
        _print(_safe('"></li>\n        <li class="record" title="'));
        _print(tr('Record'));
        _print(_safe('"></li>\n    '));
      } else {
        _print(_safe('\n        '));
        if (!this.wasactive) {
          _print(_safe('\n            <li class="toggle-timer" title="'));
          _print(tr('Toggle timer'));
          _print(_safe('"></li>\n        '));
        }
        _print(_safe('\n    '));
      }
    
      _print(_safe('\n</ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/external/youtube/tpl/youtube.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<img src="'));
    
      _print(this.thumbnail);
    
      _print(_safe('" class="thumb" />\n<h3>'));
    
      _print(this.title);
    
      _print(_safe('</h3>\n'));
    
      if (this.addonEnabled) {
        _print(_safe('\n    <span class="play flat-btn action">Play in Kodi</span>\n    <span class="localplay flat-btn action">Play in browser</span>\n'));
      } else {
        _print(_safe('\n    <span class="play flat-btn action">Play in browser</span>\n'));
      }
    
      _print(_safe('\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/filter/show/tpl/filter_options.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="options-search-wrapper">\n    <input class="options-search" value="" />\n</div>\n<div class="deselect-all">'));
    
      _print(t.gettext('Deselect all'));
    
      _print(_safe('</div>\n<ul class="selection-list"></ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/filter/show/tpl/filters_bar.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<span class="filters-active-all">'));
    
      _print(this.filters);
    
      _print(_safe('</span><i class="remove"></i>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/filter/show/tpl/filters_ui.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="filters-container">\n\n    <div class="filters-current filter-pane">\n        <div class="nav-section"></div>\n\n        <h3 class="open-filters">'));
    
      _print(t.gettext('Filters'));
    
      _print(_safe('<i></i></h3>\n        <div class="filters-active"></div>\n\n        <h3>'));
    
      _print(t.gettext('Sort'));
    
      _print(_safe('</h3>\n        <div class="list sort-options"></div>\n    </div>\n\n    <div class="filters-page filter-pane">\n        <h3 class="close-filters">'));
    
      _print(t.gettext('Select a filter'));
    
      _print(_safe('</h3>\n        <div class="list filters-list"></div>\n    </div>\n\n    <div class="filters-options filter-pane">\n        <h3 class="close-options">'));
    
      _print(t.gettext('Select an option'));
    
      _print(_safe('</h3>\n        <div class="list filter-options-list"></div>\n    </div>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/filter/show/tpl/list_item.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe(this.title));
    
      _print(_safe('\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/help/overview/tpl/overview.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<h1>'));
    
      _print(tr("About Chorus"));
    
      _print(_safe('</h1>\n<h2>'));
    
      _print(tr("Status report"));
    
      _print(_safe('</h2>\n<div class="help--overview--report">\n    <ul>\n\t<li class="report-chorus-version"><strong>Chorus '));
    
      _print(tr("version"));
    
      _print(_safe('</strong><span></span></li>\n\t<li class="report-kodi-version"><strong>Kodi '));
    
      _print(tr("version"));
    
      _print(_safe('</strong><span></span></li>\n\t<li class="report-websockets"><strong>'));
    
      _print(tr("Remote control"));
    
      _print(_safe('</strong><span></span></li>\n\t<li class="report-local-audio"><strong>'));
    
      _print(tr("Local audio"));
    
      _print(_safe('</strong><span></span></li>\n    </ul>\n</div>\n<div class="help--overview--header"></div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/input/remote/tpl/remote_control.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div id="remote-background" class="close-remote"></div>\n<div class="remote kodi-remote">\n    <div class="toggle-visibility"></div>\n    <div class="playing-area">\n\n    </div>\n    <div class="main-controls">\n        <div class="direction">\n            <div class="pad">\n                <div class="ibut mdi-hardware-keyboard-arrow-left left input-button" data-type="Left"></div>\n                <div class="ibut mdi-hardware-keyboard-arrow-up up input-button" data-type="Up"></div>\n                <div class="ibut mdi-hardware-keyboard-arrow-down down input-button" data-type="Down"></div>\n                <div class="ibut mdi-hardware-keyboard-arrow-right right input-button" data-type="Right"></div>\n                <div class="ibut mdi-image-brightness-1 ok input-button" data-type="Select"></div>\n            </div>\n        </div>\n        <div class="buttons">\n            <div class="ibut mdi-action-settings-power power-button"></div>\n            <div class="ibut mdi-navigation-more-vert input-button" data-type="ContextMenu"></div>\n            <div class="ibut mdi-action-info info-button" data-type="Info"></div>\n        </div>\n    </div>\n    <div class="secondary-controls">\n        <div class="ibut mdi-hardware-keyboard-return input-button" data-type="Back"></div>\n        <div class="ibut mdi-av-stop player-button" data-type="Stop"></div>\n        <div class="ibut mdi-maps-store-mall-directory input-button" data-type="Home"></div>\n    </div>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/input/remote/tpl/system.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var action, _i, _len, _ref;
    
      _print(_safe('<ul class="system-menu__options options">\n    '));
    
      _ref = this.actions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        action = _ref[_i];
        _print(_safe('\n        <li data-action="'));
        _print(action.id);
        _print(_safe('">'));
        _print(action.title);
        _print(_safe('</li>\n    '));
      }
    
      _print(_safe('\n</ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/lab/apiBrowser/tpl/api_browser_landing.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="api-browser--landing page">\n    <h2>'));
    
      _print(t.gettext('Kodi API browser'));
    
      _print(_safe('</h2>\n    <h4><a href="#lab">'));
    
      _print(t.gettext('Chorus lab'));
    
      _print(_safe('</a></h4>\n    <div class="api-browser--content">\n        <p>'));
    
      _print(t.gettext('This is a tool to test out the api. Select a method then execute it with parameters.'));
    
      _print(_safe('</p>\n        <br />\n        <div class="alert alert-dismissable alert-warning">\n            <button type="button" class="close" data-dismiss="alert">×</button>\n            <h4>'));
    
      _print(t.gettext('Warning'));
    
      _print(_safe('</h4>\n            <p>'));
    
      _print(t.gettext('You could potentially damage your system with this and there are no sanity checks. Use at own risk.'));
    
      _print(_safe('<br /></p>\n        </div>\n    </div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/lab/apiBrowser/tpl/api_method_item.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="api-method--item">\n    <h4 class="method">'));
    
      _print(this.method);
    
      _print(_safe('</h4>\n    <p class="description">'));
    
      _print(this.description);
    
      _print(_safe('</p>\n</div>\n\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/lab/apiBrowser/tpl/api_method_list.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="api-methods--list">\n    <p class="search-box"><input type="text" id="api-search" class="api-methods--search" /></p>\n    <ul class="items"></ul>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/lab/apiBrowser/tpl/api_method_page.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('\n<div class="api-method--info page">\n    <h2 class="method"><a href="http://kodi.wiki/view/JSON-RPC_API/v6#'));
    
      _print(this.method);
    
      _print(_safe('" target="_blank">'));
    
      _print(this.method);
    
      _print(_safe('</a></h2>\n    <p class="description">'));
    
      _print(this.description);
    
      _print(_safe('</p>\n\n</div>\n\n'));
    
      if (this.type === 'method') {
        _print(_safe('\n    <div class="api-method--execute">\n        <h3>Execute <strong>'));
        _print(this.method);
        _print(_safe('</strong> with these params:</h3>\n            <textarea class="api-method--params" placeholder=\'Eg. ["arg", "foo", true]\'></textarea>\n            <p class="description">Parameters get parsed by\n                <a href="https://developer.mozilla.org/en/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse" target="_blank">JSON.parse</a>.\n                Check the console for response objects, you will get an \'unexpected token\' error if parsing failed.\n                Params should be an array \'[]\' matching below \'Method params\'. Only use double quotes for strings/keys.\n            </p>\n            <p class="description">\n                Pass params as array Eg. [true] or [255, ["born", "formed", "thumbnail"]] or [] or [255]. Brackets required.<br />\n                Pass params as object Eg. {songid: 255} or {songid: 255, fields: ["born", "formed", "thumbnail"]}. Braces required.<br />\n            </p>\n        <p><button class="btn btn-primary" id="send-command">Send Command</button></p>\n\n    </div>\n'));
      }
    
      _print(_safe('\n\n<div class="api-method--result" id="api-result"></div>\n\n<h3>'));
    
      if (this.type === 'method') {
        _print(_safe('Method '));
      }
    
      _print(_safe('Params</h3>\n<div class="api-method--params"></div>\n\n'));
    
      if (this.type === 'method') {
        _print(_safe('\n    <hr />\n    <h3>Method Returns</h3>\n    <div class="api-method--return"></div>\n'));
      }
    
      _print(_safe('\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/lab/iconBrowser/tpl/icon_browser_page.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<h3>Material Icons</h3>\n<ul id="icons-material"></ul>\n\n<h3>Custom Icons</h3>\n<ul id="icons-custom"></ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/lab/lab/tpl/lab_item.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<a class="lab-item" href="#'));
    
      _print(this.path);
    
      _print(_safe('">\n    <h4>'));
    
      _print(this.title);
    
      _print(_safe('</h4>\n    <p>'));
    
      _print(this.description);
    
      _print(_safe('</p>\n</a>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/landing/show/tpl/landing_page.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<a id="landing-hero"></a>\n<div class="landing-sections">\n    <div id="landing-section-1"></div>\n    <div id="landing-section-2"></div>\n    <div id="landing-section-3"></div>\n    <div id="landing-section-4"></div>\n    <div id="landing-section-5"></div>\n    <div id="landing-section-6"></div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/loading/show/tpl/loading_page.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div id="loading-page">\n    <div class="spinner-double-section-far"></div>\n    <h2>'));
    
      _print(t.gettext("Just a sec..."));
    
      _print(_safe('</h2>\n</div>\n\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/localPlaylist/list/tpl/playlist.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<span class="item">\n    '));
    
      if (this.path) {
        _print(_safe('\n        <a href="#'));
        _print(this.path);
        _print(_safe('"'));
        if (this.active) {
          _print(_safe(' class="active"'));
        }
        _print(_safe('>\n            '));
        _print(this.title);
        _print(_safe('\n        </a>\n    '));
      } else {
        _print(_safe('\n        '));
        _print(this.title);
        _print(_safe('\n    '));
      }
    
      _print(_safe('\n</span>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/localPlaylist/list/tpl/playlist_layout.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="local-playlist-header">\n    <h2></h2>\n    <div class="dropdown">\n        <i data-toggle="dropdown"></i>\n        <ul class="dropdown-menu">\n            <li class="play">'));
    
      _print(tr('Play in Kodi'));
    
      _print(_safe('</li>\n            <li class="localplay">'));
    
      _print(tr('Play in browser'));
    
      _print(_safe('</li>\n            <li class="export">'));
    
      _print(tr('Export list'));
    
      _print(_safe('</li>\n            <div class="divider"></div>\n            <li class="rename">'));
    
      _print(tr('Rename playlist'));
    
      _print(_safe('</li>\n            <li class="clear">'));
    
      _print(tr('Clear playlist'));
    
      _print(_safe('</li>\n            <li class="delete">'));
    
      _print(tr('Delete playlist'));
    
      _print(_safe('</li>\n        </ul>\n    </div>\n</div>\n<div class="item-container">\n    <div class="empty-content">'));
    
      _print(t.gettext('Empty playlist, you should probably add something to it?'));
    
      _print(_safe('</div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/localPlaylist/list/tpl/playlist_list.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<h3></h3>\n<ul class="lists options"></ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/localPlaylist/list/tpl/playlist_sidebar_layout.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="current-lists"></div>\n<div class="new-list">'));
    
      _print(tr('New playlist'));
    
      _print(_safe('</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/movie/show/tpl/content.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="section-content">\n    <h2>'));
    
      _print(t.gettext('Synopsis'));
    
      _print(_safe('</h2>\n    '));
    
      if (this.mediaTrailer && this.mediaTrailer.source === 'youtube') {
        _print(_safe('\n        <div class="trailer '));
        _print(this.mediaTrailer.source);
        _print(_safe('">\n            <img src="'));
        _print(_safe(this.mediaTrailer.img));
        _print(_safe('" />\n        </div>\n    '));
      }
    
      _print(_safe('\n    <p>'));
    
      _print(this.plot);
    
      _print(_safe('</p>\n    <ul class="inline-links">\n        <li>'));
    
      _print(_safe(helpers.url.imdbUrl(this.imdbnumber, 'View on IMDb')));
    
      _print(_safe('</li>\n    </ul>\n</div>\n\n'));
    
      if (this.cast.length > 0) {
        _print(_safe('\n    <div class="section-content">\n        <h2>'));
        _print(t.gettext('Full cast'));
        _print(_safe('</h2>\n        <div class="region-cast"></div>\n    </div>\n'));
      }
    
      _print(_safe('\n\n<div class="region-more-1"></div>\n<div class="region-more-2"></div>\n<div class="region-more-3"></div>\n<div class="region-more-4"></div>\n<div class="region-more-5"></div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/movie/show/tpl/details_meta.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var sub, _i, _len, _ref;
    
      _print(_safe('<div class="region-details-top">\n    <div class="region-details-title">\n        <h2><span class="title">'));
    
      _print(this.label);
    
      _print(_safe('</span> <span class="sub"><a href="#movies?year='));
    
      _print(this.year);
    
      _print(_safe('">'));
    
      _print(this.year);
    
      _print(_safe('</a></span></h2>\n    </div>\n    <div class="region-details-rating">\n        '));
    
      _print(this.rating);
    
      _print(_safe(' <i></i>\n    </div>\n</div>\n\n<div class="region-details-meta-below">\n\n    <div class="region-details-subtext">\n        <div class="runtime">\n            '));
    
      _print(helpers.global.formatTime(helpers.global.secToTime(this.runtime)));
    
      _print(_safe('\n        </div>\n    </div>\n\n    <div class="tagline">'));
    
      _print(this.plotoutline);
    
      _print(_safe('</div>\n\n    <ul class="meta">\n        '));
    
      if (this.genre.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.gettext("genre"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'genre', this.genre)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.director.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("Director", "Directors", this.director.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('movies', 'director', this.director)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.writer.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("Writer", "Writers", this.writer.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('movies', 'writer', this.writer)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.cast.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.gettext("Cast"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('movies', 'cast', _.pluck(this.cast, 'name'))));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.mpaa) {
        _print(_safe('\n            <li><label>'));
        _print(t.gettext("rated"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('movies', 'mpaa', [this.mpaa])));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n    </ul>\n\n    <ul class="streams">\n        '));
    
      if (this.streamdetails.video.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.gettext('Video'));
        _print(_safe(':</label> <span>'));
        _print(_.pluck(this.streamdetails.video, 'label').join(', '));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.streamdetails.audio.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.gettext('Audio'));
        _print(_safe(':</label> <span>'));
        _print(_.pluck(this.streamdetails.audio, 'label').join(', '));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.streamdetails.subtitle.length > 0 && this.streamdetails.subtitle[0].label !== '') {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("Subtitle", "Subtitles", this.streamdetails.subtitle.length));
        _print(_safe(':</label>\n                <span class="dropdown"><span data-toggle="dropdown">'));
        _print(_.pluck(this.streamdetails.subtitle, 'label').join(', '));
        _print(_safe('</span>\n                <ul class="dropdown-menu">\n                    '));
        _ref = this.streamdetails.subtitle;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sub = _ref[_i];
          _print(_safe('\n                        <li>'));
          _print(sub.label);
          _print(_safe('</li>\n                    '));
        }
        _print(_safe('\n                </ul>\n                </span>\n            </li>\n        '));
      }
    
      _print(_safe('\n    </ul>\n\n    <ul class="inline-links">\n        <li class="btn-flat-play play">'));
    
      _print(t.gettext('Play'));
    
      _print(_safe('</li>\n        <li class="btn-flat-add add">'));
    
      _print(tr('Queue'));
    
      _print(_safe('</li>\n        <li class="btn-flat-stream stream">'));
    
      _print(t.gettext('Stream'));
    
      _print(_safe('</li>\n        <li class="btn-flat-watched watched">\n            '));
    
      _print(t.gettext('set'));
    
      _print(_safe(' <span class="action-watched">'));
    
      _print(t.gettext('watched'));
    
      _print(_safe('</span><span class="action-unwatched">'));
    
      _print(t.gettext('unwatched'));
    
      _print(_safe('</span>\n        </li>\n        <li class="more-actions dropdown">\n            <span class="btn-flat-more" data-toggle="dropdown" aria-expanded="true">'));
    
      _print(tr('more'));
    
      _print(_safe('</span>\n            <ul class="dropdown-menu pull-right">\n                <li class="download">'));
    
      _print(tr('Download'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="dropdown-submenu internal-search">'));
    
      _print(tr('Chorus Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        '));
    
      _print(_safe(helpers.entities.getAddonSearchMenuItems(this.label)));
    
      _print(_safe('\n                    </ul>\n                </li>\n                <li class="dropdown-submenu external-search">'));
    
      _print(tr('External Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        <li data-type="google" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">Google</li>\n                        <li data-type="imdb" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">IMDb</li>\n                        <li data-type="tmdb" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">TVDb</li>\n                    </ul>\n                </li>\n                <li class="youtube-search" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">'));
    
      _print(tr('YouTube Search'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="refresh">'));
    
      _print(tr('Refresh'));
    
      _print(_safe('</li>\n                <li class="edit">'));
    
      _print(tr('Edit'));
    
      _print(_safe('</li>\n            </ul>\n        </li>\n    </ul>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/movie/show/tpl/set.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="section-content">\n    <div class="set-collection">\n        <h2 class="set-name"></h2>\n        <div class="collection-items"></div>\n    </div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/musicvideo/show/tpl/details_meta.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="region-details-top">\n    <div class="region-details-title">\n        <h2><span class="title">'));
    
      _print(this.label);
    
      _print(_safe('</span></h2>\n    </div>\n    '));
    
      if (this.rating) {
        _print(_safe('\n        <div class="region-details-rating">\n            '));
        _print(this.rating);
        _print(_safe(' <i></i>\n        </div>\n    '));
      }
    
      _print(_safe('\n</div>\n\n<div class="region-details-meta-below">\n\n    <ul class="meta">\n        '));
    
      if (this.artist) {
        _print(_safe('\n            <li><label>'));
        _print(tr("artist"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('music/videos', 'artist', [this.artist])));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.album) {
        _print(_safe('\n            <li><label>'));
        _print(tr("album"));
        _print(_safe(':</label> <span><a href="#music/videos?album='));
        _print(this.album);
        _print(_safe('">'));
        _print(this.album);
        _print(_safe('</a></span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.genre.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("genre", "genres", this.genre.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('music/videos', 'genre', this.genre)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.director.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("Director", "Directors", this.director.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('music/videos', 'director', this.director)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.studio.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("Studio", "Studios", this.studio.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('music/videos', 'studio', this.studio)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n    </ul>\n\n    <div class="description">'));
    
      _print(this.plot);
    
      _print(_safe('</div>\n\n    <ul class="inline-links">\n        <li class="btn-flat-play play">'));
    
      _print(tr('Play'));
    
      _print(_safe('</li>\n        <li class="btn-flat-add add">'));
    
      _print(tr('Queue'));
    
      _print(_safe('</li>\n        <li class="btn-flat-stream localplay">'));
    
      _print(tr('Stream'));
    
      _print(_safe('</li>\n        <li class="more-actions dropdown">\n            <span class="btn-flat-more" data-toggle="dropdown" aria-expanded="true">'));
    
      _print(tr('more'));
    
      _print(_safe('</span>\n            <ul class="dropdown-menu pull-right">\n                <li class="download">'));
    
      _print(tr('Download'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="dropdown-submenu internal-search">'));
    
      _print(tr('Chorus Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        '));
    
      _print(_safe(helpers.entities.getAddonSearchMenuItems(this.title)));
    
      _print(_safe('\n                    </ul>\n                </li>\n                <li class="dropdown-submenu external-search">'));
    
      _print(tr('External Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        <li data-type="google" data-query="'));
    
      _print(this.title);
    
      _print(_safe(' '));
    
      _print(this.artist);
    
      _print(_safe('">Google</li>\n                    </ul>\n                </li>\n                <li class="youtube-search" data-query="'));
    
      _print(this.title);
    
      _print(_safe(' '));
    
      _print(this.artist);
    
      _print(_safe('">'));
    
      _print(tr('YouTube Search'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="edit">'));
    
      _print(tr('Edit'));
    
      _print(_safe('</li>\n            </ul>\n        </li>\n    </ul>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/navMain/show/tpl/navMain.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var child, item, _i, _j, _len, _len1, _ref, _ref1;
    
      _print(_safe('<div id="nav-header"></div>\n<nav>\n    <ul>\n        '));
    
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        if (!(item.path !== 'undefined' && item.parent === 0)) {
          continue;
        }
        _print(_safe('\n            <li class="'));
        _print(item["class"]);
        _print(_safe('">\n                <a href="#'));
        _print(item.path);
        _print(_safe('">\n                    <i class="'));
        _print(item.icon);
        _print(_safe('"></i>\n                    <span>'));
        _print(item.title);
        _print(_safe('</span>\n                </a>\n\n                '));
        if (item.children.length !== 0) {
          _print(_safe('\n                <ul>\n                    '));
          _ref1 = item.children;
          for (_j = 0, _len1 = _ref1.length; _j < _len1; _j++) {
            child = _ref1[_j];
            if (!(child.path !== 'undefined')) {
              continue;
            }
            _print(_safe('\n                      <li><a href="#'));
            _print(child.path);
            _print(_safe('">'));
            _print(child.title);
            _print(_safe('</a></li>\n                    '));
          }
          _print(_safe('\n                </ul>\n                '));
        }
        _print(_safe('\n            </li>\n        '));
      }
    
      _print(_safe('\n    </ul>\n</nav>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/navMain/show/tpl/nav_item.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe(this.link));
    
      _print(_safe('\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/navMain/show/tpl/nav_sub.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<h3>'));
    
      _print(this.title);
    
      _print(_safe('</h3>\n<ul class="items"></ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/player/show/tpl/player.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="player">\n\n    <div class="controls-primary">\n        <div class="controls-primary-buttons">\n            <div class="control control-prev"></div>\n            <div class="control control-play"></div>\n            <div class="control control-next"></div>\n        </div>\n    </div>\n\n    <div class="controls-secondary">\n        <div class="volume slider-bar"></div>\n        <div class="controls-secondary-buttons">\n            <div class="control control-mute"></div>\n            <div class="control control-repeat"></div>\n            <div class="control control-shuffle"></div>\n            <div class="control control-menu"></div>\n        </div>\n    </div>\n\n    <div class="now-playing">\n        <div class="playing-thumb thumb">\n            <div class="mdi remote-toggle"></div>\n        </div>\n        <div class="playing-info">\n            <div class="playing-progress slider-bar"></div>\n            <div class="playing-time">\n                <div class="playing-time-current">0</div>\n                <div class="playing-time-duration">0:00</div>\n            </div>\n            <div class="playing-meta">\n                <div class="playing-title">'));
    
      _print(t.gettext('Nothing playing'));
    
      _print(_safe('</div>\n                <div class="playing-subtitle"></div>\n            </div>\n        </div>\n    </div>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/playlist/list/tpl/playlist_bar.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="playlist-header">\n    <ul class="player-toggle">\n        <li class="kodi">'));
    
      _print(t.gettext('Kodi'));
    
      _print(_safe('</li>\n        <li class="local">'));
    
      _print(t.gettext('Local'));
    
      _print(_safe('</li>\n    </ul>\n    <div class="playlist-menu dropdown">\n        <i data-toggle="dropdown" class="menu-toggle"></i>\n        <ul class="dropdown-menu pull-right">\n            <li class="dropdown-header">'));
    
      _print(t.gettext('Current playlist'));
    
      _print(_safe('</li>\n            <li><a href="#" class="clear-playlist">'));
    
      _print(t.gettext('Clear playlist'));
    
      _print(_safe('</a></li>\n            <li><a href="#" class="refresh-playlist">'));
    
      _print(t.gettext('Refresh playlist'));
    
      _print(_safe('</a></li>\n            <li><a href="#" class="party-mode">'));
    
      _print(t.gettext('Party mode'));
    
      _print(_safe(' <i class="mdi-navigation-check"></i></a></li>\n            <li class="dropdown-header">'));
    
      _print(t.gettext('Kodi'));
    
      _print(_safe('</li>\n            <li><a href="#" class="save-playlist">'));
    
      _print(t.gettext('Save Kodi playlist'));
    
      _print(_safe('</a></li>\n            </li>\n        </ul>\n    </div>\n</div>\n<div class="playlists-wrapper">\n    <div class="kodi-playlists">\n        <ul class="media-toggle">\n            <li class="audio">'));
    
      _print(t.gettext('Audio'));
    
      _print(_safe('</li>\n            <li class="video">'));
    
      _print(t.gettext('Video'));
    
      _print(_safe('</li>\n        </ul>\n        <div class="kodi-playlist"></div>\n    </div>\n    <div class="local-playlists">\n        <div class="local-playlist"></div>\n    </div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/playlist/list/tpl/playlist_item.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="item-inner item-'));
    
      _print(this.type);
    
      _print(_safe('">\n    <div class="artwork">\n        <div class="thumb" title="'));
    
      _print(this.label);
    
      _print(_safe('" style="background-image: url(\''));
    
      _print(this.thumbnail);
    
      _print(_safe('\')">\n            <div class="mdi play"></div>\n            '));
    
      if (this.canThumbsUp) {
        _print(_safe('\n                <div class="mdi thumbs"></div>\n            '));
      }
    
      _print(_safe('\n        </div>\n    </div>\n    <div class="meta">\n        <div class="title"><a href="#'));
    
      _print(this.url);
    
      _print(_safe('" title="'));
    
      _print(this.label);
    
      _print(_safe('">'));
    
      _print(this.label);
    
      _print(_safe('</a></div>\n        '));
    
      if (this.subtitle) {
        _print(_safe('\n        <div class="subtitle">'));
        _print(this.subtitle);
        _print(_safe('</div>\n        '));
      }
    
      _print(_safe('\n    </div>\n    <div class="remove"></div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/playlist/m3u/tpl/list.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var item, _i, _len, _ref;
    
      _print(_safe('#EXTCPlayListM3U::M3U\n'));
    
      _ref = this.items;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        item = _ref[_i];
        _print(_safe('#EXTINF:'));
        _print(item.duration);
        _print(_safe(','));
        _print(item.artist.join('/'));
        _print(_safe(' - '));
        _print(item.label);
        _print(_safe('\n'));
        _print(item.file);
        _print(_safe('\n'));
      }
    
      _print(_safe('\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/playlist/show/tpl/landing.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="playlist-page playlist-page__empty set-page">\n    <h3>'));
    
      _print(t.gettext('Now playing - Playlists'));
    
      _print(_safe('</h3>\n    <p>'));
    
      _print(t.gettext('Switch between Kodi and local playback via the tabs. You can toggle visibility with the arrow in the top right'));
    
      _print(_safe('</p>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/pvr/recordingList/tpl/recording.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="title">\n    <strong>'));
    
      _print(this.label);
    
      _print(_safe('</strong> <span>- '));
    
      _print(this.channel);
    
      _print(_safe('</span>\n</div>\n<div class="date">\n    '));
    
      _print(this.start.toString('h:mmtt').toLowerCase());
    
      _print(_safe(' -\n    '));
    
      if (this.end.toString('yyyy') !== '1970') {
        _print(_safe('\n        '));
        _print(this.end.toString('h:mmtt').toLowerCase());
        _print(_safe('\n        ('));
        _print(helpers.global.formatTime(helpers.global.secToTime(this.runtime)));
        _print(_safe(')\n    '));
      } else {
        _print(_safe('\n        '));
        _print(tr('Now'));
        _print(_safe('\n    '));
      }
    
      _print(_safe('\n\n    <br />'));
    
      _print(this.start.toString('dddd, dS MMM'));
    
      _print(_safe('\n</div>\n<div class="plot">'));
    
      _print(this.plot);
    
      _print(_safe('</div>\n<div class="entity-progress">\n    <div class="current-progress" style="width: '));
    
      _print(this.progress);
    
      _print(_safe('%" title="'));
    
      _print(this.progress);
    
      _print(_safe('% '));
    
      _print(t.gettext('complete'));
    
      _print(_safe('"></div>\n</div>\n<ul class="actions">\n    <li class="play"></li>\n</ul>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/search/list/tpl/search_layout.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="search-inner">\n    <div class="entity-set entity-set-movie"></div>\n    <div class="entity-set entity-set-tvshow"></div>\n    <div class="entity-set entity-set-artist"></div>\n    <div class="entity-set entity-set-album"></div>\n    <div class="entity-set entity-set-song"></div>\n    <div class="entity-set entity-set-musicvideo"></div>\n    <div class="entity-set entity-set-loading"></div>\n    <div class="entity-set entity-set-addons"></div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/search/list/tpl/search_sidebar.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="sidebar-section sidebar-section-media">\n    <h3>Local media</h3>\n    <ul class="search-media-links"></ul>\n</div>\n\n<div class="sidebar-section sidebar-section-addon">\n    <h3>Addons</h3>\n    <ul class="search-addon-links"></ul>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/search/show/tpl/landing.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="search-page search-page__empty set-page">\n    <h3>'));
    
      _print(t.gettext('Enter your search above'));
    
      _print(_safe('</h3>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/settings/show/tpl/settings_sidebar.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="settings-sidebar">\n    <div class="settings-sidebar--section local-nav nav-sub"></div>\n    <div class="settings-sidebar--section kodi-nav"></div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/shell/show/tpl/homepage.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div id="homepage"></div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/shell/show/tpl/shell.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div id="shell">\n\n    <a id="logo" href="#"></a>\n\n    <div id="nav-bar"></div>\n\n    <div id="header">\n\n        <h1 id="page-title">\n            <span class="context"></span>\n            <span class="title"></span>\n        </h1>\n\n        <ul class="mobile-menu">\n            <li><a href="#remote" class="mobile-menu--link__remote remote-toggle"><i></i></a></li>\n            <li><a href="#search" class="mobile-menu--link__search"><i></i></a></li>\n            <li><a href="#playlist" class="mobile-menu--link__playlist"><i></i></a></li>\n        </ul>\n\n        <div id="selected-region">\n            <div class="selected-text">\n                <span id="selected-count"></span>\n            </div>\n            <i data-toggle="dropdown" class="menu-toggle"></i>\n            <ul class="dropdown-menu pull-right">\n                <li class="selected-play">'));
    
      _print(tr('Play in Kodi'));
    
      _print(_safe('</li>\n                <li class="selected-add">'));
    
      _print(tr('Queue in Kodi'));
    
      _print(_safe('</li>\n                <li class="selected-localadd">'));
    
      _print(tr('Add to playlist'));
    
      _print(_safe('</li>\n            </ul>\n        </div>\n\n        <div id="search-region">\n            <input id="search" title="Search">\n            <span id="do-search"></span>\n        </div>\n\n    </div>\n\n    <div id="main">\n\n        <div id="sidebar-one"></div>\n\n        <div id="content">'));
    
      _print(tr("Loading things..."));
    
      _print(_safe('</div>\n\n    </div>\n\n    <div id="sidebar-two">\n        <div class="playlist-toggle-open"></div>\n        <div id="playlist-summary"></div>\n        <div id="playlist-bar"></div>\n    </div>\n\n    <div id="remote"></div>\n\n    <div id="player-wrapper">\n        <footer id="player-kodi"></footer>\n        <footer id="player-local"></footer>\n    </div>\n\n    <div class="player-menu-wrapper">\n        <ul class="player-menu">\n            <li class="video-scan">'));
    
      _print(t.gettext("Scan video library"));
    
      _print(_safe('</li>\n            <li class="audio-scan">'));
    
      _print(t.gettext("Scan audio library"));
    
      _print(_safe('</li>\n            <li class="send-input">'));
    
      _print(t.gettext("Send text to Kodi"));
    
      _print(_safe('</li>\n            <li class="goto-lab">'));
    
      _print(t.gettext("The lab"));
    
      _print(_safe('</li>\n            <li class="about">'));
    
      _print(t.gettext("About Chorus"));
    
      _print(_safe('</li>\n        </ul>\n    </div>\n\n</div>\n\n<div id="fanart"></div>\n<div id="fanart-overlay"></div>\n\n<div id="snackbar-container"></div>\n\n<div class="modal fade" id="modal-window">\n    <div class="modal-dialog">\n        <div class="modal-content">\n            <div class="modal-header">\n                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>\n                <h4 class="modal-title"></h4>\n            </div>\n            <div class="modal-body"></div>\n            <div class="modal-footer"></div>\n        </div>\n    </div>\n</div>\n\n<div id="disconnected">\n    <div class="message">\n        <i class="mdi-file-cloud-off"></i>\n        <h2>'));
    
      _print(tr('Lost connection to Kodi'));
    
      _print(_safe('</h2>\n        <p class="try-connect"><button class="reconnect btn btn-primary">'));
    
      _print(tr('Attempt to reconnect'));
    
      _print(_safe('</button></p>\n        <p class="load-connect"><span class="loader-small-inline"></span><br />'));
    
      _print(tr('Attempting reconnect'));
    
      _print(_safe('</p>\n    </div>\n</div>\n\n<div id="offscreen"></div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/song/list/tpl/song.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<td class="cell-first">\n    <div class="thumb" style="background-image: url(\''));
    
      _print(this.thumbnail);
    
      _print(_safe('\')">\n    </div>\n    <div class="track">'));
    
      _print(this.track);
    
      _print(_safe('</div>\n    <div class="mdi play"></div>\n</td>\n<td class="cell-label song-title"><span class="crop">'));
    
      _print(this.label);
    
      _print(_safe('</span></td>\n<td class="cell-label song-album"><a class="crop" href="#music/album/'));
    
      _print(this.albumid);
    
      _print(_safe('">'));
    
      _print(this.album);
    
      _print(_safe('</a></td>\n<td class="cell-label song-artist"><a class="crop" href="#music/artist/'));
    
      _print(this.artistid);
    
      _print(_safe('">'));
    
      _print(this.artist);
    
      _print(_safe('</a></td>\n<td class="cell-last">\n    <li class="thumbed-up"></li>\n    <div class="duration">'));
    
      _print(this.displayDuration);
    
      _print(_safe('</div>\n    <ul class="actions">\n        <li class="mdi thumbs"></li>\n        <li class="mdi add"></li>\n        <li class="menu dropdown">\n            <i data-toggle="dropdown" class="mdi"></i>\n            <ul class="dropdown-menu pull-right"></ul>\n        </li>\n    </ul>\n</td>\n<td class="cell-remove song-remove">\n    <i class="mdi mdi-navigation-close"></i>\n</td>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/thumbs/list/tpl/thumbs_layout.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="thumbs-inner">\n    <div class="entity-set entity-set-movie"></div>\n    <div class="entity-set entity-set-tvshow"></div>\n    <div class="entity-set entity-set-episode"></div>\n    <div class="entity-set entity-set-artist"></div>\n    <div class="entity-set entity-set-album"></div>\n    <div class="entity-set entity-set-song"></div>\n    <div class="entity-set entity-set-musicvideo"></div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/thumbs/list/tpl/thumbs_set.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<h2 class="set-header"></h2>\n<div class="set-results"></div>\n<div class="more"></div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/tvshow/episode/tpl/content.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('\n<div class="section-content">\n    <h2>'));
    
      _print(t.gettext('Synopsis'));
    
      _print(_safe('</h2>\n    <p>'));
    
      _print(this.plot);
    
      _print(_safe('</p>\n</div>\n\n'));
    
      if (this.cast.length > 0) {
        _print(_safe('\n    <div class="section-content">\n        <h2>'));
        _print(tr('Full cast'));
        _print(_safe('</h2>\n        <div class="region-cast"></div>\n    </div>\n'));
      }
    
      _print(_safe('\n\n<div class="section-content section-full-width">\n    <h2>'));
    
      _print(tr('Season'));
    
      _print(_safe(' '));
    
      _print(this.season);
    
      _print(_safe('</h2>\n    <div class="region-season"></div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/tvshow/episode/tpl/details_meta.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var sub, _i, _len, _ref;
    
      _print(_safe('<div class="region-details-top">\n    '));
    
      if (this.showtitle != null) {
        _print(_safe('\n\n    '));
      }
    
      _print(_safe('\n    <div class="region-details-title">\n        <h2>\n            <span class="title">'));
    
      _print(this.label);
    
      _print(_safe('</span>\n            <span class="sub show-title"><a href="#'));
    
      _print(this.url.split('/', 2).join('/'));
    
      _print(_safe('">'));
    
      _print(this.showtitle);
    
      _print(_safe('</a></span>\n            <span class="sub">S'));
    
      _print(this.season);
    
      _print(_safe(' E'));
    
      _print(this.episode);
    
      _print(_safe('</span>\n        </h2>\n    </div>\n    <div class="region-details-rating">\n        '));
    
      _print(this.rating);
    
      _print(_safe(' <i></i>\n    </div>\n</div>\n<div class="region-details-meta-below">\n\n    <div class="region-details-subtext">\n\n        '));
    
      if (this.runtime > 0) {
        _print(_safe('\n            <div class="runtime">\n                '));
        _print(helpers.global.formatTime(helpers.global.secToTime(this.runtime)));
        _print(_safe('\n            </div>\n        '));
      }
    
      _print(_safe('\n\n    </div>\n\n    <ul class="meta">\n        <li><label>'));
    
      _print(t.gettext('Season'));
    
      _print(_safe(':</label> <span><a href="#tvshow/'));
    
      _print(this.tvshowid);
    
      _print(_safe('/'));
    
      _print(this.season);
    
      _print(_safe('">'));
    
      _print(t.gettext('Season'));
    
      _print(_safe(' '));
    
      _print(this.season);
    
      _print(_safe('</a></span></li>\n        '));
    
      if (this.firstaired) {
        _print(_safe('\n            <li><label>'));
        _print(t.gettext('First aired'));
        _print(_safe(':</label> <span>'));
        _print(this.firstaired);
        _print(_safe(' </span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.director.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("Director", "Directors", this.director.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'director', this.director)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.writer.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("Writer", "Writers", this.writer.length));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'writer', this.writer)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.cast.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.gettext('Cast'));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'cast', _.pluck(this.cast, 'name'))));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n    </ul>\n\n    <ul class="streams">\n        '));
    
      if (this.streamdetails.video.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.gettext('Video'));
        _print(_safe(':</label> <span>'));
        _print(_.pluck(this.streamdetails.video, 'label').join(', '));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.streamdetails.audio.length > 0) {
        _print(_safe('\n            <li><label>'));
        _print(t.gettext('Audio'));
        _print(_safe(':</label> <span>'));
        _print(_.pluck(this.streamdetails.audio, 'label').join(', '));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.streamdetails.subtitle.length > 0 && this.streamdetails.subtitle[0].label !== '') {
        _print(_safe('\n            <li><label>'));
        _print(t.ngettext("Subtitle", "Subtitles", this.streamdetails.subtitle.length));
        _print(_safe(':</label>\n                <span class="dropdown"><span data-toggle="dropdown">'));
        _print(_.first(_.pluck(this.streamdetails.subtitle, 'label')));
        _print(_safe('</span>\n                <ul class="dropdown-menu">\n                    '));
        _ref = this.streamdetails.subtitle;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          sub = _ref[_i];
          _print(_safe('\n                        <li>'));
          _print(sub.label);
          _print(_safe('</li>\n                    '));
        }
        _print(_safe('\n                </ul>\n                </span>\n            </li>\n        '));
      }
    
      _print(_safe('\n    </ul>\n\n    <ul class="inline-links">\n        <li class="btn-flat-play play">'));
    
      _print(tr('Play'));
    
      _print(_safe('</li>\n        <li class="btn-flat-add add">'));
    
      _print(tr('Queue'));
    
      _print(_safe('</li>\n        <li class="btn-flat-stream stream">'));
    
      _print(tr('Stream'));
    
      _print(_safe('</li>\n        <li class="btn-flat-watched watched">\n            '));
    
      _print(t.gettext('set'));
    
      _print(_safe(' <span class="action-watched">'));
    
      _print(tr('watched'));
    
      _print(_safe('</span><span class="action-unwatched">'));
    
      _print(tr('unwatched'));
    
      _print(_safe('</span>\n        </li>\n        <li class="more-actions dropdown">\n            <span class="btn-flat-more" data-toggle="dropdown" aria-expanded="true">'));
    
      _print(tr('more'));
    
      _print(_safe('</span>\n            <ul class="dropdown-menu pull-right">\n                <li class="download">'));
    
      _print(tr('Download'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="dropdown-submenu internal-search">'));
    
      _print(tr('Chorus Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        '));
    
      _print(_safe(helpers.entities.getAddonSearchMenuItems(this.showtitle)));
    
      _print(_safe('\n                    </ul>\n                </li>\n                <li class="dropdown-submenu external-search">'));
    
      _print(tr('External Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        <li data-type="google" data-query="'));
    
      _print(this.showtitle);
    
      _print(_safe(' '));
    
      _print(this.label);
    
      _print(_safe('">Google</li>\n                        <li data-type="imdb" data-query="'));
    
      _print(this.showtitle);
    
      _print(_safe('">IMDb</li>\n                        <li data-type="tvdb" data-query="'));
    
      _print(this.showtitle);
    
      _print(_safe('">TVDb</li>\n                        <li data-type="tmdb" data-query="'));
    
      _print(this.showtitle);
    
      _print(_safe('">TMDb</li>\n                    </ul>\n                </li>\n                <li class="youtube-search" data-query="'));
    
      _print(this.showtitle);
    
      _print(_safe('">'));
    
      _print(tr('YouTube Search'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="refresh">'));
    
      _print(tr('Refresh'));
    
      _print(_safe('</li>\n                <li class="edit">'));
    
      _print(tr('Edit'));
    
      _print(_safe('</li>\n            </ul>\n        </li>\n    </ul>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/tvshow/season/tpl/details_meta.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="region-details-top">\n    <div class="region-details-title">\n        <h2>\n            <span class="title">'));
    
      _print(tr('Season'));
    
      _print(_safe(' '));
    
      _print(this.season);
    
      _print(_safe('</span>\n            <span class="sub"><a href="#tvshow/'));
    
      _print(this.tvshowid);
    
      _print(_safe('">'));
    
      _print(this.label);
    
      _print(_safe('</a></span>\n        </h2>\n    </div>\n    <div class="region-details-rating">\n        '));
    
      _print(this.rating);
    
      _print(_safe(' <i></i>\n    </div>\n</div>\n<div class="region-details-meta-below">\n\n    <ul class="meta">\n        '));
    
      if (this.genre.length > 0) {
        _print(_safe('\n        <li><label>'));
        _print(tr("genre"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'genre', this.genre)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.cast.length > 0) {
        _print(_safe('\n        <li><label>'));
        _print(tr("cast"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'cast', _.pluck(this.cast, 'name'))));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.studio.length > 0) {
        _print(_safe('\n        <li><label>'));
        _print(tr("studio"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'studio', this.studio)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.mpaa) {
        _print(_safe('\n        <li><label>'));
        _print(tr("rated"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'mpaa', [this.mpaa])));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        <li><label>'));
    
      _print(tr("episodes"));
    
      _print(_safe(':</label> <span><span class="episode-total">'));
    
      _print(this.episode);
    
      _print(_safe('</span> '));
    
      _print(tr("total"));
    
      _print(_safe(' (<span class="episode-unwatched">'));
    
      _print(this.unwatched);
    
      _print(_safe('</span> '));
    
      _print(tr("unwatched"));
    
      _print(_safe(')</span></li>\n    </ul>\n\n    <div class="description">'));
    
      _print(this.plot);
    
      _print(_safe('</div>\n\n    <ul class="inline-links">\n        <li class="btn-flat-play play">'));
    
      _print(tr('Play'));
    
      _print(_safe('</li>\n        <li class="btn-flat-add add">'));
    
      _print(tr('Queue'));
    
      _print(_safe('</li>\n        <li class="btn-flat-watched watched">\n            '));
    
      _print(tr('set'));
    
      _print(_safe(' <span class="action-watched">'));
    
      _print(tr('watched'));
    
      _print(_safe('</span><span class="action-unwatched">'));
    
      _print(tr('unwatched'));
    
      _print(_safe('</span>\n        </li>\n    </ul>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["apps/tvshow/show/tpl/details_meta.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="region-details-top">\n    <div class="region-details-title">\n        <h2><span class="title">'));
    
      _print(this.label);
    
      _print(_safe('</span> <span class="sub">'));
    
      _print(this.year);
    
      _print(_safe('</span></h2>\n    </div>\n    <div class="region-details-rating">\n        '));
    
      _print(this.rating);
    
      _print(_safe(' <i></i>\n    </div>\n</div>\n<div class="region-details-meta-below">\n\n    <ul class="meta">\n        '));
    
      if (this.genre.length > 0) {
        _print(_safe('\n        <li><label>'));
        _print(tr("genre"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'genre', this.genre)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.cast.length > 0) {
        _print(_safe('\n        <li><label>'));
        _print(tr("cast"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'cast', _.pluck(this.cast, 'name'))));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.studio.length > 0) {
        _print(_safe('\n        <li><label>'));
        _print(tr("studio"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'studio', this.studio)));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        '));
    
      if (this.mpaa) {
        _print(_safe('\n        <li><label>'));
        _print(tr("rated"));
        _print(_safe(':</label> <span>'));
        _print(_safe(helpers.url.filterLinks('tvshows', 'mpaa', [this.mpaa])));
        _print(_safe('</span></li>\n        '));
      }
    
      _print(_safe('\n        <li><label>'));
    
      _print(tr("episodes"));
    
      _print(_safe(':</label> <span><span class="episode-total">'));
    
      _print(this.episode);
    
      _print(_safe('</span> '));
    
      _print(tr("total"));
    
      _print(_safe(' (<span class="episode-unwatched">'));
    
      _print(this.unwatched);
    
      _print(_safe('</span> '));
    
      _print(tr("unwatched"));
    
      _print(_safe(')</span></li>\n    </ul>\n\n    <div class="description">'));
    
      _print(this.plot);
    
      _print(_safe('</div>\n\n    <ul class="inline-links">\n        <li class="btn-flat-play play">'));
    
      _print(tr('Play'));
    
      _print(_safe('</li>\n        <li class="btn-flat-add add">'));
    
      _print(tr('Queue'));
    
      _print(_safe('</li>\n        <li class="btn-flat-watched watched">\n            '));
    
      _print(tr('set'));
    
      _print(_safe(' <span class="action-watched">'));
    
      _print(tr('watched'));
    
      _print(_safe('</span><span class="action-unwatched">'));
    
      _print(tr('unwatched'));
    
      _print(_safe('</span>\n        </li>\n        <li class="more-actions dropdown">\n            <span class="btn-flat-more" data-toggle="dropdown" aria-expanded="true">'));
    
      _print(tr('more'));
    
      _print(_safe('</span>\n            <ul class="dropdown-menu pull-right">\n                <li class="dropdown-submenu internal-search">'));
    
      _print(tr('Chorus Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        '));
    
      _print(_safe(helpers.entities.getAddonSearchMenuItems(this.label)));
    
      _print(_safe('\n                    </ul>\n                </li>\n                <li class="dropdown-submenu external-search">'));
    
      _print(tr('External Search'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        <li data-type="google" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">Google</li>\n                        <li data-type="imdb" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">IMDb</li>\n                        <li data-type="tvdb" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">TVDb</li>\n                        <li data-type="tmdb" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">TMDb</li>\n                    </ul>\n                </li>\n                <li class="youtube-search" data-query="'));
    
      _print(this.label);
    
      _print(_safe('">'));
    
      _print(tr('YouTube Search'));
    
      _print(_safe('</li>\n                <li class="divider"></li>\n                <li class="dropdown-submenu">'));
    
      _print(tr('Refresh'));
    
      _print(_safe('\n                    <ul class="dropdown-menu">\n                        <li class="refresh">'));
    
      _print(tr('Show only'));
    
      _print(_safe('</li>\n                        <li class="refresh-episodes">'));
    
      _print(tr('Show and episodes'));
    
      _print(_safe('</li>\n                    </ul>\n                </li>\n                <li class="edit">'));
    
      _print(tr('Edit'));
    
      _print(_safe('</li>\n            </ul>\n        </li>\n    </ul>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["components/form/tpl/form.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="form-inner">\n  <div class="form-content-region"></div>\n    <footer>\n        <ul class="inline-list">\n            <li>\n                <button type="submit" data-form-button="submit" class="btn btn-primary form-save">Save</button>\n            </li>\n            <li class="response">\n\n            </li>\n        </ul>\n    </footer>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["components/form/tpl/form_item.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      if (this.titleHtml) {
        _print(_safe('\n    <label class="control-label">'));
        _print(_safe(this.titleHtml));
        _print(_safe('</label>\n'));
      }
    
      _print(_safe('\n\n'));
    
      if (this.type === 'markup') {
        _print(_safe('\n    '));
        _print(_safe(this.element));
        _print(_safe('\n'));
      } else {
        _print(_safe('\n    <div class="element">\n        '));
        if (this.type !== 'checkbox') {
          _print(_safe('\n            '));
          _print(_safe(this.element));
          _print(_safe('\n        '));
        } else {
          _print(_safe('\n            <div class="togglebutton">\n                <label>'));
          _print(_safe(this.element));
          _print(_safe('</label>\n            </div>\n        '));
        }
        _print(_safe('\n        '));
        if (this.description) {
          _print(_safe('\n        <div class="help-block description">'));
          _print(_safe(this.description));
          _print(_safe('</div>\n        '));
        }
        _print(_safe('\n    </div>\n'));
      }
    
      _print(_safe('\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["components/form/tpl/form_item_group.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      if (this.title) {
        _print(_safe('\n    <h3 class="group-title">'));
        if (this.icon) {
          _print(_safe('<i class="'));
          _print(this.icon);
          _print(_safe('"></i> '));
        }
        _print(this.title);
        _print(_safe('</h3>\n'));
      }
    
      _print(_safe('\n<div class="form-items"></div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["components/form/tpl/form_item_imageselect.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="form-imageselect">\n    <ul class="form-imageselect__tabs">\n        <li data-pane="select" class="active">'));
    
      _print(tr('Selector'));
    
      _print(_safe('</li>\n        <li data-pane="url">'));
    
      _print(tr('URL'));
    
      _print(_safe('</li>\n    </ul>\n    <div class="form-imageselect__panes">\n        <div class="pane active" rel="select">\n            <ul class="form-imageselect__thumbs">\n                '));
    
      if (this.image) {
        _print(_safe('\n                    <li data-original="'));
        _print(this.image.original);
        _print(_safe('" class="selected" style="background-image: url(\''));
        _print(this.image.thumb);
        _print(_safe('\')"></li>\n                '));
      }
    
      _print(_safe('\n            </ul>\n            <div class="form-imageselect__loader"><div class="loader-small-inline"></div> <span>'));
    
      _print(tr('Searching for more images'));
    
      _print(_safe('</span></div>\n        </div>\n        <div class="pane" rel="url">\n            '));
    
      if (this.title) {
        _print(_safe('\n            <label class="control-label">'));
        _print(this.title);
        _print(_safe('</label>\n            '));
      }
    
      _print(_safe('\n            <div class="form-imageselect__url">\n                '));
    
      _print(_safe(this.element));
    
      _print(_safe('\n            </div>\n            '));
    
      if (this.description) {
        _print(_safe('\n                <div class="help-block description">'));
        _print(_safe(this.description));
        _print(_safe('</div>\n            '));
      }
    
      _print(_safe('\n        </div>\n    </div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["views/card/tpl/card.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
      var key, val, _ref;
    
      _print(_safe('<div class="card-'));
    
      _print(this.type);
    
      _print(_safe('">\n    <div class="artwork">\n        <a href="#'));
    
      _print(this.url);
    
      _print(_safe('" class="thumb" title="'));
    
      _print(helpers.global.stripTags(this.labelHtml));
    
      _print(_safe('" style="background-image: url(\''));
    
      _print(this.thumbnail);
    
      _print(_safe('\')"></a>\n        <div class="mdi play" title="'));
    
      _print(tr('Play'));
    
      _print(_safe('"></div>\n        '));
    
      if (this.type === "channeltv" || this.type === "channelradio") {
        _print(_safe('\n          <div class="mdi record"></div>\n        '));
      }
    
      _print(_safe('\n    </div>\n    <div class="meta">\n        <div class="title"><a href="#'));
    
      _print(this.url);
    
      _print(_safe('" title="'));
    
      _print(helpers.global.stripTags(this.labelHtml));
    
      _print(_safe('">'));
    
      _print(_safe(this.labelHtml));
    
      _print(_safe('</a></div>\n        '));
    
      if (this.subtitleHtml) {
        _print(_safe('\n            <div class="subtitle">'));
        _print(_safe(this.subtitleHtml));
        _print(_safe('</div>\n        '));
      }
    
      _print(_safe('\n    </div>\n    '));
    
      if (this.actions) {
        _print(_safe('\n        <ul class="actions">\n            '));
        _ref = this.actions;
        for (key in _ref) {
          val = _ref[key];
          _print(_safe('<li class="mdi '));
          _print(key);
          _print(_safe('" title="'));
          _print(val);
          _print(_safe('"></li>'));
        }
        _print(_safe('\n        </ul>\n    '));
      }
    
      _print(_safe('\n    '));
    
      if (this.menu) {
        _print(_safe('\n        <div class="dropdown">\n            <i data-toggle="dropdown" class="mdi"></i>\n            <ul class="dropdown-menu"></ul>\n        </div>\n    '));
      }
    
      _print(_safe('\n    '));
    
      this.progress = this.progress != null ? this.progress : 0;
    
      _print(_safe('\n    <div class="entity-progress"><div class="current-progress" style="width: '));
    
      _print(this.progress);
    
      _print(_safe('%" title="'));
    
      _print(this.progress);
    
      _print(_safe('% '));
    
      _print(t.gettext('complete'));
    
      _print(_safe('"></div></div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["views/card/tpl/card_placeholder.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<i></i>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["views/empty/tpl/empty_page.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="empty--page">\n    '));
    
      if (this.title) {
        _print(_safe('\n        <h2 class="empty--page-title">'));
        _print(title);
        _print(_safe('</h2>\n    '));
      }
    
      _print(_safe('\n\n    '));
    
      if (this.content) {
        _print(_safe('\n        <div class="empty--page-content">'));
        _print(this.content);
        _print(_safe('</div>\n    '));
      }
    
      _print(_safe('\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["views/empty/tpl/empty_results.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="empty-result">\n    <h2>'));
    
      _print(_safe(t.sprintf(tr('No %1$s found'), '<span class="empty-key">' + tr('results') + '</span>')));
    
      _print(_safe('</h2>\n    <div class="empty-actions">\n        <div class="back-link"></div>\n    </div>\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["views/layouts/tpl/layout_details_header.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="layout-container details-header">\n\n    <div class="region-details-side"></div>\n\n    <div class="region-details-meta-wrapper"><div class="region-details-meta">\n\n        <div class="region-details-title"><span class="title"></span> <span class="sub"></span></div>\n\n        <div class="region-details-meta-below">\n            <div class="region-details-subtext"></div>\n            <div class="description"></div>\n        </div>\n\n    </div></div>\n\n    '));
    
      if (this.fanart) {
        _print(_safe('\n        <div class="region-details-fanart" style="background-image: url(\''));
        _print(this.fanart);
        _print(_safe('\')"><div class="gradient"></div></div>\n    '));
      }
    
      _print(_safe('\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["views/layouts/tpl/layout_with_header.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="layout-container with-header">\n\n    <header class="region-header"></header>\n\n    <div class="region-content-wrapper">\n        <div class="entity-progress"><div class="current-progress" style="width: '));
    
      _print(this.progress);
    
      _print(_safe('%" title="'));
    
      _print(this.progress);
    
      _print(_safe('% '));
    
      _print(t.gettext('complete'));
    
      _print(_safe('"></div></div>\n        <section class="region-content"></section>\n    </div>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["views/layouts/tpl/layout_with_sidebar_first.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="layout-container with-sidebar-first">\n\n    <div class="region-first-toggle"></div>\n    <section class="region-first">\n        <div class="region-first-primary"></div>\n        <div class="region-first-secondary"></div>\n    </section>\n\n    <section class="region-content-wrapper">\n        <div class="region-content-top"></div>\n        <div class="region-content"></div>\n    </section>\n\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["views/set/tpl/set.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<div class="set">\n    '));
    
      if (this.title) {
        _print(_safe('\n        <div class="set__header">\n            <h2 class="set__title">'));
        _print(this.title);
        _print(_safe('</h2>\n            <div class="set__actions">\n                '));
        if (this.menu) {
          _print(_safe('\n                <div class="dropdown">\n                    <i data-toggle="dropdown" class="mdi"></i>\n                    <ul class="dropdown-menu pull-right"></ul>\n                </div>\n                '));
        }
        _print(_safe('\n            </div>\n        </div>\n    '));
      }
    
      _print(_safe('\n    <div class="set__items">\n        <'));
    
      _print(this.childViewTag);
    
      _print(_safe(' class="set__collection '));
    
      _print(this.childViewClass);
    
      _print(_safe('"></'));
    
      _print(this.childViewTag);
    
      _print(_safe('>\n    </div>\n    '));
    
      if (this.more) {
        _print(_safe('\n        <div class="set__more">'));
        _print(_safe(this.more));
        _print(_safe('</div>\n    '));
      }
    
      _print(_safe('\n</div>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};

window.JST["views/song/tpl/song_placeholder.jst"] = function(__obj) {
  var _safe = function(value) {
    if (typeof value === 'undefined' && value == null)
      value = '';
    var result = new String(value);
    result.ecoSafe = true;
    return result;
  };
  return (function() {
    var __out = [], __self = this, _print = function(value) {
      if (typeof value !== 'undefined' && value != null)
        __out.push(value.ecoSafe ? value : __self.escape(value));
    }, _capture = function(callback) {
      var out = __out, result;
      __out = [];
      callback.call(this);
      result = __out.join('');
      __out = out;
      return _safe(result);
    };
    (function() {
    
      _print(_safe('<td colspan="6"><i></i></td>\n'));
    
    }).call(this);
    
    return __out.join('');
  }).call((function() {
    var obj = {
      escape: function(value) {
        return ('' + value)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;');
      },
      safe: _safe
    }, key;
    for (key in __obj) obj[key] = __obj[key];
    return obj;
  })());
};
