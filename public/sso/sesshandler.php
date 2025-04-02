<?php 

if(!isset($_SESSION)){
    session_start();
}

// Check API Key
if(isset($_SESSION['sso']['api'])){
    $ip = $_SERVER['REMOTE_ADDR']; 
    $sno = $_REQUEST['sno'];
    $host = "localhost:8080";
    $url = "http://".$host."/sso/v1/init?ip=".urlencode($ip)."&sno=".urlencode($sno);
    // Make CURL for data
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_HEADER, 0);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    $output = curl_exec($ch);      
    curl_close($ch);
    $data = json_decode($output);
    // set json string to php variables
    /* $userName = $data_back->{"userName"};
    $password = $data_back->{"password"};
    $emailProvider = $data_back->{"emailProvider"};*/

    // Store Data in $_SESSION
    $_SESSION['sso']['data'] = $data['data'];
    // Generate and Echo Script - Session Checker
    $script = <<<SCRIPT
        <script type="text/javascript">
              var ts = setInterval(() => {
                 \$.post()
              },5000);
        </script>
SCRIPT;

      // IF session out -- redirect to Forbidden page
}else{
    // Forbidden Page
}


?>