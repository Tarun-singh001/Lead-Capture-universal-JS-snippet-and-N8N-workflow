// Configuration
 To be used inside the HTML file

<script>
window.LEAD_CAPTURE_CUSTOMER = "abc-industries"; // customer name
  window.LEAD_CAPTURE_WEBHOOK = "https://taru2106.app.n8n.cloud/webhook/lead-webhook"; //n8n webhook 
  window.LEAD_CAPTURE_MAPPINGS = {
    cx_name: "CustomerName", //custom mapping example 
    os_name: "LeadSource", //custom mapping example 
    fmi_name: "CustomerName" //custom mapping example 
  };
</script>
<script src="lead-capture.js"></script>
