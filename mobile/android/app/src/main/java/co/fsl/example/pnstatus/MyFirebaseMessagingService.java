package co.fsl.example.pnstatus;

import android.content.SharedPreferences;
import android.os.Bundle;
import android.util.Log;

import com.google.firebase.messaging.RemoteMessage;
import com.wix.reactnativenotifications.fcm.FcmInstanceIdListenerService;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;

public class MyFirebaseMessagingService extends FcmInstanceIdListenerService {
    static final String LOGTAG = "FCM";

    @Override
    public void onMessageReceived(RemoteMessage message){
        super.onMessageReceived(message);

        Bundle bundle = message.toIntent().getExtras();
        Log.d(LOGTAG, "New message from FCM: " + bundle);

        SharedPreferences prefs = this.getSharedPreferences("group.fsl.pnstatus", MODE_PRIVATE);
        String endpoint = prefs.getString("endpoint", null);

        String notificationId = null;
        if (bundle != null) {
            notificationId = bundle.getString("notificationId");
        }

        if (endpoint == null || notificationId == null) {
            Log.d(LOGTAG, "Couldn't find note ID or endpoint!");
            return;
        }

        Log.d(LOGTAG, "Bunk1: received notification with id: " + notificationId + ". Sending to: " + endpoint);

        HttpURLConnection con = null;

        try {
            URL url = new URL(endpoint + "/" + notificationId + "?status=RECEIVED");
            con = (HttpURLConnection)url.openConnection();
            con.setDoOutput(true);

            con.setRequestMethod("POST");

            int code = con.getResponseCode();
            Log.d(LOGTAG, "Completed Push Notification Phone Home with status: " + code);
        }
        catch (Exception e) {
            Log.e(LOGTAG, "Push notification phone home failed: " + e.getMessage());
        }
        finally {
            if (con != null) {
                con.disconnect();
            }
        }
    }
}
