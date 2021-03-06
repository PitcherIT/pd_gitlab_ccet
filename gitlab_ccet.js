/*-----Configurable Options - Edit as required-----------------------
Specify for which Action/Status types for certain object_kinds of when to record a change event*/
const mre_actions = ['merge','reopen']; //Merge Request Events Actions (open, close, reopen, update, approved, unapproved, merge)
const ie_actions = ['close']; //Issue Events action types (open, close, reopen, update)
const de_status = ['success', 'failed']; //Deployment Event Statuses (created, running, success, failed, canceled)
const pe_status = ['success', 'failed']; // Pipeline Event Statuses (created, waiting_for_resource, preparing, pending, running, success, failed, canceled, skipped, manual, scheduled)
const re_actions = ['create', 'update']; //Release Events action types (create, update)
//-------------------------------------------------------------------

//Get input body
var webhook = PD.inputRequest.body;

//Check if Webhook is of the supported object kind
const objectkind = ['push','tag_push','issue','merge_request','wiki_page','pipeline','build','deployment','release','feature_flag'];
if(objectkind.indexOf(webhook.object_kind) < 0) {
  PD.fail('The action type for this Merge Request object is not in the supported list');
}

//Start PD-CEF payload items
var changeEvent = {
  payload: {
    source: 'GitLab',
    custom_details: {
      object_type: webhook.object_kind
    }
  },
  links: []
};

var custom_details = changeEvent.payload.custom_details;
var bFail = 0;
var summary;

//Add specific payload items
switch(webhook.object_kind) {
  case 'merge_request':
    //Check action type is in the mre_actions list
    if(mre_actions.indexOf(webhook.object_attributes.action) > -1) {
      //Handle "merge" action text for subject use
      if(webhook.object_attributes.action=='merge'){
        summary = '[Merged - ' + webhook.repository.name + '] ' + webhook.object_attributes.title;
      } else {
        summary = '[Merge ' + webhook.object_attributes.action + ' - ' + webhook.repository.name + '] ' + webhook.object_attributes.title;
      }
      custom_details.merge_commit_sha= webhook.object_attributes.merge_commit_sha;
      custom_details.source_branch= webhook.object_attributes.source_branch;
      custom_details.target_branch= webhook.object_attributes.target_branch;  
      custom_details.state= webhook.object_attributes.state;
      custom_details.action= webhook.object_attributes.action;
      changeEvent.links.push({
        href: webhook.object_attributes.url,
        text: 'View Request on GitLab'
      });
    } else {
        bFail = 1
    }
    break;
  case 'push':
  case 'tag_push':
    //Set summary based on Tag or Push event 
    if(webhook.object_kind=='tag_push'){
      summary = '[Tag Event - ';
    } else {
      summary = '[Push Event - ';
    }
    summary+= webhook.repository.name + '] Total Commits:' + webhook.total_commits_count;
    custom_details.checkout_sha= webhook.checkout_sha;
    custom_details.ref= webhook.ref;
    custom_details.total_commits_count= webhook.total_commits_count;  
    break;
  case 'issue':
    //Check action type is in the ie_actions list
    if(ie_actions.indexOf(webhook.object_attributes.action) > -1) {  
      summary = '[Issue ' + webhook.object_attributes.action + ' - ' + webhook.repository.name + '] ' + webhook.object_attributes.title;
      custom_details.issue_id= webhook.object_attributes.id;
      custom_details.due_date= webhook.object_attributes.due_date;
      custom_details.assignees= JSON.stringify(webhook.assignees, ['name']);  
      custom_details.state= webhook.object_attributes.state;
      custom_details.action= webhook.object_attributes.action;
      changeEvent.links.push({
        href: webhook.object_attributes.url,
        text: 'View Issue on GitLab'
      });
    } else {
      bFail = 1;
    }
    break;
  case 'wiki_page':
    summary = '[Wiki Page ' + webhook.object_attributes.action + ' - ' + webhook.project.name + '] ' + webhook.object_attributes.title;
    custom_details.message= webhook.object_attributes.message;
    custom_details.format= webhook.object_attributes.format;  
    custom_details.slug= webhook.object_attributes.slug;
    custom_details.action= webhook.object_attributes.action;
    changeEvent.links.push({
      href: webhook.object_attributes.url,
      text: 'View Wiki on GitLab'
    });
    break;
  case 'pipeline':
    if(pe_status.indexOf(webhook.object_attributes.status) > -1) {  
        summary = '[Pipeline ' + webhook.object_attributes.status + ' - ' + webhook.project.name + '] ' + webhook.object_attributes.id + ': ' + webhook.commit.title ;
        custom_details.ref= webhook.object_attributes.ref;
        custom_details.sha= webhook.object_attributes.sha;  
        custom_details.source= webhook.object_attributes.source;
        custom_details.status= webhook.object_attributes.status;
        changeEvent.links.push({
            href: webhook.commit.url,
            text: 'View Commit on GitLab'
        });
    } else {
        bFail = 1;
    }
    break;
  case 'build':
    summary = '[Job ' + webhook.build_status + ' - ' + webhook.repository.name + '] ' + webhook.build_name;
    custom_details.ref= webhook.ref;
    custom_details.sha= webhook.sha;  
    custom_details.build_id= webhook.build_id;
    custom_details.build_status= webhook.build_status;
    break;
  case 'deployment':
    if(pe_status.indexOf(webhook.status) > -1) {  
        summary = '[Deployment ' + webhook.status + ' - ' + webhook.project.name + '] ' + webhook.commit_title;
        custom_details.status= webhook.status;
        custom_details.environment = webhook.environment;  
        custom_details.deployment_id= webhook.deployment_id;
        custom_details.commit_title= webhook.commit_title;
        changeEvent.links.push({
        href: webhook.commit_url,
        text: 'View Commit on GitLab'
        });
    } else {
        bFail = 1;
    }
    break;
  case 'feature_flag':
    if(webhook.object_attributes.active==true){
      summary = '[Feature Flag Enabled - '
    } else {
      summary = '[Feature Flag Disabled - '
    } 
    summary+= webhook.project.name + '] ' + webhook.object_attributes.name;
    custom_details.id= webhook.object_attributes.id;
    custom_details.name = webhook.object_attributes.name;  
    custom_details.description= webhook.object_attributes.description;
    custom_details.active= webhook.active;
    break;
  case 'release':    
    //Check action type is in the re_actions list
    if(re_actions.indexOf(webhook.action) > -1) {  
      summary = '[Release ' + webhook.action + 'd - ' + webhook.project.name + '] ' + webhook.name;
      custom_details.description= webhook.description;
      custom_details.due_date= webhook.due_date;
      custom_details.created_at= webhook.created_at;  
      custom_details.released_at= webhook.released_at;
      changeEvent.links.push({
        href: webhook.url,
        text: 'View Release on GitLab'
      });
    } else {
      bFail = 1;
    }
    break;
  default:
    bFail = 1;
}
//Set the summary property
changeEvent.payload.summary = summary;

//Add Project data if object exists
if(webhook.hasOwnProperty('project')){
  custom_details.project_name= webhook.project.name;
  custom_details.project_path= webhook.project.path_with_namespace;
  changeEvent.links.push({
    href: webhook.project.web_url,
    text: 'View Project on GitLab'
  });
}

//Add Repository if object exists
if(webhook.hasOwnProperty('repository')){
    custom_details.repo = webhook.repository.name;
}

//Add User object if object exists, otherwise use top level properties
if(webhook.hasOwnProperty('user')){
  custom_details.user = webhook.user.name + ' (' + webhook.user.username +')';
  custom_details.user_email = webhook.user.email;
} else {
  custom_details.user = webhook.user_name + ' (' + webhook.user_username +')';
  custom_details.user_email = webhook.user_email;
}

//Exit if forced failure based on previous rules, otherwise submit change event
if(bFail == 1){
  PD.fail('The action type for this ' + webhook.object_kind + ' object is not in the supported list');
} else {
  PD.emitChangeEvents([changeEvent]);
}
