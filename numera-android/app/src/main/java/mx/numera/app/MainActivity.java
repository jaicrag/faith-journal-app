package mx.numera.app;
import android.app.Activity;
import android.os.Bundle;
import android.content.Intent;
import android.net.Uri;
import android.content.Context;
import android.util.Base64;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebChromeClient;
import android.widget.Toast;
import java.io.*;
public class MainActivity extends Activity {
 private static final int SAVE=102,OPEN=103;
 private WebView web;
 private byte[] pending;
 @Override public void onCreate(Bundle state){
  super.onCreate(state);
  web=new WebView(this);setContentView(web);
  WebSettings settings=web.getSettings();
  settings.setJavaScriptEnabled(true); settings.setDomStorageEnabled(true);
  settings.setAllowFileAccess(true);settings.setAllowFileAccessFromFileURLs(false);
  settings.setAllowUniversalAccessFromFileURLs(false);
  settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
  web.setWebChromeClient(new WebChromeClient());
  web.setWebViewClient(new WebViewClient(){
   @Override public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r){
    return !("file".equals(r.getUrl().getScheme())&&r.getUrl().toString().startsWith("file:///android_asset/"));
   }
  });
  web.addJavascriptInterface(new Bridge(),"Android");
  web.loadUrl("file:///android_asset/index.html");
 }
 public class Bridge {
  @JavascriptInterface public String getVersion(){
   try{return MainActivity.this.getPackageManager().getPackageInfo(MainActivity.this.getPackageName(),0).versionName;}
   catch(Exception e){return "1.6.0";}
  }
  @JavascriptInterface public void saveFile(String filename,String data,String mime){
   runOnUiThread(()->{try {
    pending=Base64.decode(data,Base64.DEFAULT);
    Intent i=new Intent(Intent.ACTION_CREATE_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE);
    i.setType(mime);i.putExtra(Intent.EXTRA_TITLE,filename);startActivityForResult(i,SAVE);
   }catch(Exception e){Toast.makeText(MainActivity.this,"Error al preparar archivo",Toast.LENGTH_LONG).show();}});
  }
  @JavascriptInterface public void importBackup(){
   runOnUiThread(()->{
    Intent i=new Intent(Intent.ACTION_OPEN_DOCUMENT).addCategory(Intent.CATEGORY_OPENABLE);
    i.setType("application/json");startActivityForResult(i,OPEN);
   });
  }
 }
 @Override protected void onActivityResult(int req,int result,Intent data){
  super.onActivityResult(req,result,data);
  if(result!=RESULT_OK||data==null||data.getData()==null)return;
  Uri uri=data.getData();
  try{
   if(req==SAVE&&pending!=null){
    try(OutputStream os=getContentResolver().openOutputStream(uri)){if(os==null)throw new IOException();os.write(pending);}
    pending=null;Toast.makeText(this,"Archivo guardado",Toast.LENGTH_SHORT).show();
   }else if(req==OPEN){
    ByteArrayOutputStream out=new ByteArrayOutputStream();
    try(InputStream is=getContentResolver().openInputStream(uri)){
     if(is==null)throw new IOException();byte[] buf=new byte[8192];int n,total=0;
     while((n=is.read(buf))!=-1){total+=n;if(total>20*1024*1024)throw new IOException();out.write(buf,0,n);}
    }
    String b64=Base64.encodeToString(out.toByteArray(),Base64.NO_WRAP);
    web.evaluateJavascript("window.importBackupBase64('"+b64+"')",null);
   }
  }catch(Exception e){Toast.makeText(this,"No se pudo guardar o abrir el archivo",Toast.LENGTH_LONG).show();}
 }
 @Override public void onBackPressed(){
  web.evaluateJavascript("(function(){if(typeof modal!=='undefined'&&modal){modal='';render();return 'stay'}if(typeof view!=='undefined'&&view!=='home'){view='home';render();return 'stay'}return 'exit'})()",r->{if("\"exit\"".equals(r))finish();});
 }
 @Override protected void onDestroy(){if(web!=null){web.destroy();web=null;}super.onDestroy();}
}