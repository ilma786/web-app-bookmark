

//tags

(function(){

    "use strict"

    
    // Plugin Constructor
    var TagsInput = function(opts){
        this.options = Object.assign(TagsInput.defaults , opts);
        this.init();
    }

    // Initialize the plugin
    TagsInput.prototype.init = function(opts){
        this.options = opts ? Object.assign(this.options, opts) : this.options;

        if(this.initialized)
            this.destroy();
            
        if(!(this.orignal_input = document.getElementById(this.options.selector)) ){
            console.error("tags-input couldn't find an element with the specified ID");
            return this;
        }

        this.ilmaarray = [];
        this.wrapper = document.createElement('div');
        this.input = document.createElement('input');
        init(this);
        initEvents(this);

        this.initialized =  true;
        return this;
    }

    // Add Tags
    TagsInput.prototype.addTag = function(string){

        if(this.anyErrors(string))
            return ;

        this.ilmaarray.push(string);
       
        var tagInput = this;


        var tag = document.createElement('span');
        tag.className = this.options.tagClass;
        tag.innerText = string;

        var closeIcon = document.createElement('a');
        closeIcon.innerHTML = '&times;';
        
        // delete the tag when icon is clicked
        closeIcon.addEventListener('click' , function(e){
            e.preventDefault();
            var tag = this.parentNode;

            for(var i =0 ;i < tagInput.wrapper.childNodes.length ; i++){
                if(tagInput.wrapper.childNodes[i] == tag)
                    tagInput.deleteTag(tag , i);
            }
        })


        tag.appendChild(closeIcon);
        this.wrapper.insertBefore(tag , this.input);
        this.orignal_input.value = this.ilmaarray.join(',');

        return this;
    }
  
    // Delete Tags
    TagsInput.prototype.deleteTag = function(tag , i){
        tag.remove();
        this.ilmaarray.splice( i , 1);
        this.orignal_input.value =  this.ilmaarray.join(',');
        return this;
    }

    // Make sure input string have no error with the plugin
    TagsInput.prototype.anyErrors = function(string){
        if( this.options.max != null && this.ilmaarray.length >= this.options.max ){
            console.log('max tags limit reached');
            return true;
        }
        
        if(!this.options.duplicate && this.ilmaarray.indexOf(string) != -1 ){
            console.log('duplicate found " '+string+' " ')
            return true;
        }

        return false;
    }

    // Add tags programmatically 
    TagsInput.prototype.addData = function(array){
        var plugin = this;
        
        array.forEach(function(string){
            plugin.addTag(string);
        })
        return this;
    }

    // Get the Input String
    TagsInput.prototype.getInputString = function(){
        return this.ilmaarray.join(',');
    }


    // destroy the plugin
    TagsInput.prototype.destroy = function(){
        this.orignal_input.removeAttribute('hidden');

        delete this.orignal_input;
        var self = this;
        
        Object.keys(this).forEach(function(key){
            if(self[key] instanceof HTMLElement)
                self[key].remove();
            
            if(key != 'options')
                delete self[key];
        });

        this.initialized = false;
    }

    // Private function to initialize the tag input plugin
    function init(tags){
        tags.wrapper.append(tags.input);
        tags.wrapper.classList.add(tags.options.wrapperClass);
        tags.orignal_input.setAttribute('hidden' , 'true');
        tags.orignal_input.parentNode.insertBefore(tags.wrapper , tags.orignal_input);
    }

    // initialize the Events
    function initEvents(tags){
        tags.wrapper.addEventListener('click' ,function(){
            tags.input.focus();           
        });
        

        tags.input.addEventListener('keydown' , function(e){
            var str = tags.input.value.trim(); 

            if( !!(~[9 , 13 , 188].indexOf( e.keyCode ))  )
            {
                e.preventDefault();
                tags.input.value = "";
                if(str != "")
                    tags.addTag(str);
            }

        });
    }


    // Set All the Default Values
    TagsInput.defaults = {
        selector : '',
        wrapperClass : 'tags-input-wrapper',
        tagClass : 'tag',
        max : null,
        duplicate: false
    }
    
    window.TagsInput = TagsInput;

})();

 var tagInput1 = new TagsInput({
            selector: 'tag-input1',
            duplicate : false,
            max : 10
        });
       
 console.log(tagInput1.ilmaarray)

document.getElementById('myForm').addEventListener('submit', saveBookmark);

// save bookmark
function saveBookmark(e) {
    // get form values
    var siteName = document.getElementById('siteName').value;
    var siteUrl = document.getElementById('siteUrl').value;


    // console.log("update2");

    if(!validateForm(siteName, siteUrl)){
        e.preventDefault();
        return false;
    }
  
    var bookmark = {
        name: siteName,
        url: siteUrl,
        tags:tagInput1.ilmaarray
    }
    // test if bookmarks is null
    if (localStorage.getItem('bookmarks') === null){
        // init array
        var bookmarks = [];
        // add to array
        bookmarks.push(bookmark);
        // set to localStorage
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    } else {
        // get bookmarks from LocalStorage
        var bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
        // add bookmark to array
        bookmarks.push(bookmark);
        // re-set back to localStorage
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    }    

    fetchBookmarks();
    //clear form
    document.getElementById('myForm').reset();
    document.getElementsByClassName('tags-input-wrapper')[0].reset();

    e.preventDefault();
}

//delete bookmark
function deleteBookmark(url) {
    // get bookmarks from localStorage
    var bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
    // loop through bookmarks
    for (i=0; i < bookmarks.length; i++) {
        if (bookmarks[i].url == url) {
            bookmarks.splice(i, 1);
        }
    }
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    // re-fetch bookmarks
    fetchBookmarks();
}

// fetch bookmarks
function fetchBookmarks() {
    // get bookmarks from localStorage
    var bookmarks = JSON.parse(localStorage.getItem('bookmarks'));
    // get output id
    var bookmarksResults = document.getElementById('bookmarksResults');
    // build output
    bookmarksResults.innerHTML = '';


    for (let i = 0; i < bookmarks.length; i++) {
        var name = bookmarks[i].name;
        var url = bookmarks[i].url;
        var tagi = bookmarks[i].tags;
        
  
        
        bookmarksResults.innerHTML +=  '<tr class="header"><td>' + name +  '</td><td><span class="tp">'+tagi.join(' </span><span class="tp">')+'</span></td><td><a id="visit" class="btn btn-primary" target="_blank" href="'+url+'">Visit</a> <button id="delete" onclick="deleteBookmark(\''+url+'\')" class="btn btn-danger" href="#">Delete</button>' +
        '' +
        '</td></tr>';
    }
    bookmarksResults.innerHTML += 
        '</table>';

        
}

function validateForm(siteName, siteUrl) {

  
    
    
    var res = siteUrl.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);



    if (!siteName || !siteUrl) {
        showMessage('Please enter Website Name and URL');
        return false;
    } else if (res == null){
        showMessage('Please enter valid URL');
        return false;
    } else {
        messageCheck();
        
        return true;
    }
}


function showMessage(message) {

    messageCheck();

    const jumbotron = document.querySelector('.jumbotron');

    // create div
    const div = document.createElement('div');

    div.id = "errorMessage";
    // add classes
    div.className = `alert alert-danger`;    
    // add text
    div.appendChild(document.createTextNode(message));
    // get myForm
    const myForm = document.getElementById('myForm');
    // insert message
    jumbotron.insertBefore(div, myForm);
    
}

function messageCheck() {
    var check = document.getElementById('errorMessage');

    const jumbotron = document.querySelector('.jumbotron');

    if (check) {
    jumbotron.removeChild(check);  
    }  
}

function myFunction() {
  var input, filter, table, tr, td, i, txtValue;
  input = document.getElementById("myInput");
  filter = input.value.toUpperCase();
  table = document.getElementById("myTable");
  tr = table.getElementsByTagName("tr");
  for (i = 0; i < tr.length; i++) {
    td= tr[i].getElementsByTagName("td")[0];
     td= tr[i].getElementsByTagName("td")[1];
   
    if (td) {
      txtValue = td.textContent || td.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        tr[i].style.display = "";
      } else {
        tr[i].style.display = "none";
      }
    }       
  }
}

