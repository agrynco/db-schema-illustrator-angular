import {HttpClient, HttpClientModule} from "@angular/common/http";
import {NgModule} from "@angular/core";
import {DbObjectsInfoService} from "./modules/illustrator/dbObjectsInfo.service";

@NgModule({
  declarations: [],
  imports: [
    HttpClientModule  // <-- HttpClientModule added to 'imports' array
  ],
  providers: [DbObjectsInfoService, HttpClient],
})
export class AppModule {
}
