export const useInternet = function(offlineHandle:(e:any)=>void){
  window.addEventListener('offline', offlineHandle);
}
