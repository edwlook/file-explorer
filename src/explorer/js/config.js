(function() {
  'use strict';

  define(['jquery', 'text!config.json'], function($, config_text) {

    var get_query_variable = function(name) {
      name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
      var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
          results = regex.exec(location.search);
      return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    };

    var config_file = JSON.parse(config_text);

    var config = {
      debug: config_file['debug'],
      logLevel: config_file['logLevel'],
      base_url: config_file['base_url'],
      exp_id: get_query_variable('exp_id'),
      app_id: get_query_variable('app_id'),
      origin: get_query_variable('origin'),
      // data options move to post messaging
      flavor: get_query_variable('flavor'),
      multiselect: JSON.parse(get_query_variable('multiselect')),
      link: JSON.parse(get_query_variable('link')),
      direct_link: JSON.parse(get_query_variable('direct_link')),
      computer: JSON.parse(get_query_variable('computer')),
      account_key: JSON.parse(get_query_variable('account_key')),
      services: JSON.parse(get_query_variable('services')),
      persist: JSON.parse(get_query_variable('persist')),
      types: JSON.parse(get_query_variable('types')).map(function(str) {
        /**
         * Make sure all types are lowercase since we do a case-insensitive
         * search by lowercasing the search key and using types#indexOf.
         */
        return str.toLowerCase();
      }),
      user_data: {}, // Get asynchronously.
      copy_to_upload_location: JSON.parse(get_query_variable('copy_to_upload_location')),
      create_folder: JSON.parse(get_query_variable('create_folder')),
      chunk_size: 5*1024*1024,
    };

    // Get user_data
    var query_params = {app_id: config.app_id}
    if (config.account_key) {
      // Only do origin check if we need to.
      query_params['origin'] = config.origin
    }
    $.get(config.base_url + "/file-explorer/config/", query_params,
          function(config_data) {
            config.user_data = (config_data && config_data.user_data) || {};

            if (config.onReceiveUserData) {
              config.onReceiveUserData(config.user_data);
            }
          });

    if (config.types.indexOf('folders') != -1 && config.types.length === 1) {
        config.computer = false;
    }

    // Service aliases
    var services = {
        all: [
            'dropbox',
            'gdrive',
            'box',
            'evernote',
            'skydrive',
            'sugarsync',
            'sharefile',
            'copy',
            'egnyte',
            's3',
            'sharepoint',
            'onedrivebiz',
            'hubspot',
            'salesforce',
            'smb',
            'azure',
            'cmis',
            'alfresco'
        ],
        file_store: [
            'dropbox',
            'gdrive',
            'box',
            'evernote',
            'skydrive',
            'sugarsync',
            'sharefile',
            'copy',
            'egnyte',
            'sharepoint',
            'onedrivebiz',
            'hubspot',
            'salesforce',
            'smb',
            'cmis',
            'alfresco'
        ],
        object_store: [
            'azure',
            's3']
    };

    var groups = [];
    if (config.services == undefined) {
        config.services = [];
        config.services = config.services.concat(services.file_store);
    } else if (config.services.length == 0) {
        config.services = [];
    } else {
        config.services = config.services.filter(function(service) {
          if (service in services) {
            groups = groups.concat(services[service]);
            return false;
          }
          return true;
        }).concat(groups);
    }

    // Type aliases.
    var aliases = {
      all: [
        'all'
      ],
      text: [
        'applescript',
        'as',
        'as3',
        'c',
        'cc',
        'clisp',
        'coffee',
        'cpp',
        'cs',
        'css',
        'csv',
        'cxx',
        'def',
        'diff',
        'erl',
        'fountain',
        'ft',
        'h',
        'hpp',
        'htm',
        'html',
        'hxx',
        'inc',
        'ini',
        'java',
        'js',
        'json',
        'less',
        'log',
        'lua',
        'm',
        'markdown',
        'mat',
        'md',
        'mdown',
        'mkdn',
        'mm',
        'mustache',
        'mxml',
        'patch',
        'php',
        'phtml',
        'pl',
        'plist',
        'properties',
        'py',
        'rb',
        'sass',
        'scss',
        'sh',
        'shtml',
        'sql',
        'tab',
        'taskpaper',
        'tex',
        'text',
        'tmpl',
        'tsv',
        'txt',
        'url',
        'vb',
        'xhtml',
        'xml',
        'yaml',
        'yml',
        ''],
      documents: [
        'csv',
        'doc',
        'dochtml',
        'docm',
        'docx',
        'docxml',
        'dot',
        'dothtml',
        'dotm',
        'dotx',
        'eps',
        'fdf',
        'key',
        'keynote',
        'kth',
        'mpd',
        'mpp',
        'mpt',
        'mpx',
        'nmbtemplate',
        'numbers',
        'odc',
        'odg',
        'odp',
        'ods',
        'odt',
        'pages',
        'pdf',
        'pdfxml',
        'pot',
        'pothtml',
        'potm',
        'potx',
        'ppa',
        'ppam',
        'pps',
        'ppsm',
        'ppsx',
        'ppt',
        'ppthtml',
        'pptm',
        'pptx',
        'pptxml',
        'prn',
        'ps',
        'pwz',
        'rtf',
        'tab',
        'template',
        'tsv',
        'txt',
        'vdx',
        'vsd',
        'vss',
        'vst',
        'vsx',
        'vtx',
        'wbk',
        'wiz',
        'wpd',
        'wps',
        'xdf',
        'xdp',
        'xlam',
        'xll',
        'xlr',
        'xls',
        'xlsb',
        'xlsm',
        'xlsx',
        'xltm',
        'xltx',
        'xps'],
      images: [
        'bmp',
        'cr2',
        'gif',
        'ico',
        'ithmb',
        'jpeg',
        'jpg',
        'nef',
        'png',
        'raw',
        'svg',
        'tif',
        'tiff',
        'wbmp',
        'webp'],
      videos: [
        '3g2',
        '3gp',
        '3gpp',
        '3gpp2',
        'asf',
        'avi',
        'dv',
        'dvi',
        'flv',
        'm2t',
        'm4v',
        'mkv',
        'mov',
        'mp4',
        'mpeg',
        'mpg',
        'mts',
        'ogv',
        'ogx',
        'rm',
        'rmvb',
        'ts',
        'vob',
        'webm',
        'wmv'],
      audio: [
        'aac',
        'aif',
        'aifc',
        'aiff',
        'au',
        'flac',
        'm4a',
        'm4b',
        'm4p',
        'm4r',
        'mid',
        'mp3',
        'oga',
        'ogg',
        'opus',
        'ra',
        'ram',
        'spx',
        'wav',
        'wma'],
      ebooks: [
        'acsm',
        'aeh',
        'azw',
        'cb7',
        'cba',
        'cbr',
        'cbt',
        'cbz',
        'ceb',
        'chm',
        'epub',
        'fb2',
        'ibooks',
        'kf8',
        'lit',
        'lrf',
        'lrx',
        'mobi',
        'opf',
        'oxps',
        'pdf',
        'pdg',
        'prc',
        'tebr',
        'tr2',
        'tr3',
        'xeb',
        'xps']
      }
      , additions = [];

    config.types = config.types.filter(function(type) {
      if (type in aliases) {
        additions = additions.concat(aliases[type]);
        return false;
      }
      return true;
    }).concat(additions);

    // remove any duplicates
    config.types = config.types.filter(function(elem, pos) {
        return config.types.indexOf(elem) == pos;
    });

    // default to 'all'
    if (config.types.length === 0) {
        config.types.push('all');
    }

    if (config.debug) {
        window.config = config;
    }

    return config;
  });
})();
