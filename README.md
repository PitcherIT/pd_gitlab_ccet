# PagerDuty GitLab Custom Change Event Transformer (WIP)

The current GitLab Changes Integration for PagerDuty only handles merge_events webhooks (https://support.pagerduty.com/docs/gitlab-changes).  
The contents of the gitlab_ccet.js file in this repo can be used to create a custom change event transformer in PagerDuty as an alternative to handle other webhook events from GitLab, including Pipeline & Releases etc.

Follow these steps to implement;

Within PagerDuty;
1. For the desired service, create a Custom Change Event Transformer (CCET) following the instructions here: https://developer.pagerduty.com/docs/ZG9jOjExMDI5NTgz-custom-change-event-transformer
2. Copy the full contents of the gitlab_ccet.js file to use for the JavaScript on the CCET.
3. Take a copy of the integration URL once the CCET is created, as you will enter this into GitLab.

Within GitLab;
1. Navigate to the GitLab project where you would like to track changes, select the Settings menu on the left, and then select Webhooks.
2. Paste the Integration URL generated in PagerDuty (above) in the URL field. Under the Trigger header, select the events you would like to trigger Changes for in PagerDuty (Currently Comments are unsupported). Click Add Webhook.
3. Once added, you will see the webhook appear below these settings. To test the integration, perform any of the activities you selected to trigger in the integrated project. In your PagerDuty account, navigate to the integrated service, click its title and you should see a change event labeled as RECENT CHANGE in grey in the Recent Activity timeline.
