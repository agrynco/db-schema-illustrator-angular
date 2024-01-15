import {HttpClient} from "@angular/common/http";
import {DbSchemaInfo, ForeignKeyInfo, TableInfo} from "./dbObjectsInfo.service.models";
import {environment} from "../../../../environments/environment";
import {map, Observable} from "rxjs";
import {Injectable} from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class DbObjectsInfoService {
  constructor(private _httpClient: HttpClient) {
  }

  getDbSchemas(): Observable<DbSchemaInfo[]> {
    return this._httpClient.get<DbSchemaInfo[]>(`${environment.apiUrl}/soapproxy/schemas`);
  }

  getTables(dbSchema: string): Observable<TableInfo[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/soapproxy/tables/${dbSchema}`)
      .pipe(map(response => response.body.getTablesResult));
  }

  getForeignKeys(dbSchema: string): Observable<ForeignKeyInfo[]> {
    return this._httpClient.get<any>(`${environment.apiUrl}/soapproxy/foreign-keys/${dbSchema}`)
      .pipe(map(response => response.body.getForeignKeysResult));
  }
}
