import {AfterViewInit, Component, ElementRef, OnInit, Renderer2, ViewChild, ViewEncapsulation} from "@angular/core";
import {GojsAngularModule} from "gojs-angular";
import * as go from 'gojs';
import {Diagram} from 'gojs';
import {DbObjectsInfoService} from "./dbObjectsInfo.service";
import {DbSchemaInfo, ForeignKeyInfo, TableInfo} from "./dbObjectsInfo.service.models";
import {FormsModule} from "@angular/forms";
import {NgForOf} from "@angular/common";
import {forkJoin} from "rxjs";

@Component({
  selector: "illustrator",
  templateUrl: "illustrator.component.html",
  styleUrls: ["illustrator.component.scss"],
  standalone: true,
  imports: [
    GojsAngularModule,
    FormsModule,
    NgForOf
  ],
  encapsulation: ViewEncapsulation.None
})
export class IllustratorComponent implements OnInit, AfterViewInit {
  @ViewChild('myDiagramDiv', {static: true}) myDiagramDiv!: ElementRef;
  private tablesInfo: TableInfo[] = [];
  private myDiagram: Diagram | null = null;

  colorSwitch(n: any) {
    const isDark = false;
    if (n === "green") return (isDark ? "#429E6F" : "#62bd8e");
    if (n === "blue") return (isDark ? "#3f9fc6" : "#3999bf");
    if (n === "purple") return (isDark ? "#9951c9" : "#7f36b0");
    if (n === "red") return (isDark ? "#ff4d3d" : "#c41000");
    return "black";
  }

  dbSchemas: DbSchemaInfo[] = [];
  selectedSchema: string = '';

  //_nodeDataArray: any[] = [];

  constructor(private _dbObjectsInfoService: DbObjectsInfoService, private renderer: Renderer2) {
    this._dbObjectsInfoService.getDbSchemas().subscribe((dbSchemas: DbSchemaInfo[]) => {
      this.dbSchemas = dbSchemas;
    });
  }

  ngAfterViewInit(): void {
    this.buildDiagram();
  }

  ngOnInit() {
    //this.buildDiagram();
  }

  private buildDiagram() {
    // Since 2.2 you can also author concise templates with method chaining instead of GraphObject.make
    // For details, see https://gojs.net/latest/intro/buildingObjects.html
    const $ = go.GraphObject.make;  // for conciseness in defining templates

    this.myDiagram =
      new go.Diagram("myDiagramDiv",   // must name or refer to the DIV HTML element
        {
          allowDelete: false,
          allowCopy: false,
          "undoManager.isEnabled": true,
          layout: $(go.ForceDirectedLayout,
            {defaultSpringLength: 30, defaultElectricalCharge: 100, arrangementOrigin: new go.Point(0, 0)})
        });

    this.myDiagram.addDiagramListener("InitialLayoutCompleted", function (e) {
      let dia = e.diagram;
      dia.startTransaction("Shift Origin");
      let leftmost = Infinity;
      dia.nodes.each(n => {
        if (n.position.x < leftmost) leftmost = n.position.x;
      });
      dia.nodes.each(n => {
        n.position.x -= leftmost;
      });
      dia.commitTransaction("Shift Origin");
    });

    // the template for each attribute in a node's array of item data
    const itemTempl =
      $(go.Panel, "Horizontal",
        $(go.Shape,
          {
            desiredSize: new go.Size(15, 15),
            strokeJoin: "round",
            strokeWidth: 3,
            stroke: "#eeeeee",
            margin: 2
          },
          new go.Binding("figure", "figure"),
          new go.Binding("fill", "color", n => this.colorSwitch(n)),
          new go.Binding("stroke", "color", n => this.colorSwitch(n))
        ),
        $(go.TextBlock,
          {font: " 14px sans-serif", stroke: "black"},
          new go.Binding("text", "name"), new go.Binding("stroke", "", n => "#f5f5f5"),
        ));

    // define the Node template, representing an entity
    this.myDiagram.nodeTemplate =
      $(go.Node, "Auto",  // the whole node panel
        {
          selectionAdorned: true,
          resizable: true,

          fromSpot: go.Spot.LeftRightSides,
          toSpot: go.Spot.LeftRightSides,
          isShadowed: true,
          shadowOffset: new go.Point(4, 4),
          shadowColor: "#919cab"
        },
        new go.Binding("location", "location").makeTwoWay(),
        // whenever the PanelExpanderButton changes the visible property of the "LIST" panel,
        // clear out any desiredSize set by the ResizingTool.
        new go.Binding("desiredSize", "visible", v => new go.Size(NaN, NaN)).ofObject("LIST"),
        // define the node's outer shape, which will surround the Table
        $(go.Shape, "RoundedRectangle",
          {stroke: "#e8f1ff", strokeWidth: 3},
          new go.Binding("fill", "", n => "#4a4a4a")
        ),
        $(go.Panel, "Table",
          {
            margin: 8,
            stretch: go.GraphObject.Fill,
            width: 160
          },
          $(go.RowColumnDefinition, {row: 0, sizing: go.RowColumnDefinition.None}),
          // the table header
          $(go.TextBlock,
            {
              row: 0, alignment: go.Spot.Center,
              margin: new go.Margin(0, 24, 0, 2),  // leave room for Button
              font: "bold 16px sans-serif"
            },
            new go.Binding("text", "key"),
            new go.Binding("stroke", "", n => "#d6d6d6")),
          // the collapse/expand button
          $("PanelExpanderButton", "LIST",  // the name of the element whose visibility this button toggles
            {row: 0, alignment: go.Spot.TopRight},
            new go.Binding("ButtonIcon.stroke", "", n => "#d6d6d6")),
          $(go.Panel, "Table",
            {name: "LIST", row: 1, stretch: go.GraphObject.Horizontal},
            $(go.TextBlock,
              {
                font: "bold 15px sans-serif",
                text: "Attributes",
                row: 0,
                alignment: go.Spot.TopLeft,
                margin: new go.Margin(8, 0, 0, 0),
              },
              new go.Binding("stroke", "", n => "#d6d6d6")),
            $("PanelExpanderButton", "NonInherited", // the name of the element whose visibility this button toggles
              {
                row: 0,
                column: 1
              },
              new go.Binding("ButtonIcon.stroke", "", n => "#d6d6d6")),
            $(go.Panel, "Vertical",
              {
                name: "NonInherited",
                alignment: go.Spot.TopLeft,
                defaultAlignment: go.Spot.Left,
                itemTemplate: itemTempl,
                row: 1
              },
              new go.Binding("itemArray", "items")),
            $(go.TextBlock,
              {
                font: "bold 15px sans-serif",
                text: "Inherited Attributes",
                row: 2,
                alignment: go.Spot.TopLeft,
                margin: new go.Margin(8, 0, 0, 0),
              },
              new go.Binding("visible", "visibility", Boolean),
              new go.Binding("stroke", "", n => "#d6d6d6")),
            $("PanelExpanderButton", "Inherited", // the name of the element whose visibility this button toggles
              {
                row: 2,
                column: 1,
              },
              new go.Binding("visible", "visibility", Boolean),
              new go.Binding("ButtonIcon.stroke", "", n => "#d6d6d6")),
            $(go.Panel, "Vertical",
              {
                name: "Inherited",
                alignment: go.Spot.TopLeft,
                defaultAlignment: go.Spot.Left,
                itemTemplate: itemTempl,
                row: 3
              },
              new go.Binding("itemArray", "inheriteditems"))
          )
        ) // end Table Panel
      );  // end Node

    // define the Link template, representing a relationship
    this.myDiagram.linkTemplate =
      $(go.Link,  // the whole link panel
        {
          selectionAdorned: true,
          layerName: "Background",
          reshapable: true,
          routing: go.Link.AvoidsNodes,
          corner: 5,
          curve: go.Link.JumpOver,
          isShadowed: true,
          shadowOffset: new go.Point(2, 2),
          shadowColor: "#919cab",
          click: (event: go.InputEvent, link: go.GraphObject) => {
            let clickedLink = link.part;
            if (clickedLink instanceof go.Link) {
              this.myDiagram!.startTransaction('add text');
              // Clear the label for all Link Panels
              this.myDiagram!.links.each((link) => {
                this.myDiagram!.model.setDataProperty(link.data, 'text', '');
              });
              // Set the label for the Link Panel that was clicked
              this.myDiagram!.model.setDataProperty(clickedLink.data, 'text', `Link goes from ${clickedLink.data.from} to ${clickedLink.data.to}`);
              this.myDiagram!.commitTransaction('add text');
            }
          }
        },
        $(go.Shape,
          {
            stroke: "#f7f9fc",
            strokeWidth: 4
          }
        ),
        $(go.Panel, "Auto", {segmentIndex: 0},
          $(go.Shape, "RoundedRectangle", {fill: "#f7f9fc"}, {stroke: "#eeeeee"}),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "bold 14px sans-serif",
              stroke: "black",
              background: "#f7f9fc",
              segmentOffset: new go.Point(0, 0) //use zero as value for both x and y
            },
            new go.Binding("text", "text"))
        ),
        $(go.Panel, "Auto", {segmentIndex: -1},
          $(go.Shape, "RoundedRectangle", {fill: "#edf6fc"}, {stroke: "#eeeeee"}),
          $(go.TextBlock,
            {
              textAlign: "center",
              font: "bold 14px sans-serif",
              stroke: "black",
              segmentOffset: new go.Point(0, 0) //use zero as value for both x and y
            },
            new go.Binding("text", "toText"))
        )
      );

    this.myDiagram.model = new go.GraphLinksModel(
      {
        copiesArrays: true,
        copiesArrayObjects: true,
        modelData: {darkMode: false},
        nodeDataArray: [],
        linkDataArray: []
      });
  }

  onSchemaChange($event: any) {
    this.selectedSchema = $event.target.value;

    let tables = this._dbObjectsInfoService.getTables($event.target.value);
    let foreignKeys = this._dbObjectsInfoService.getForeignKeys($event.target.value);

    forkJoin({tables, foreignKeys}).subscribe(results => {
      let transformForeighKeysToLinks = this.transformForeighKeysToLinks(results.foreignKeys);

      var model = new go.GraphLinksModel(this.transformToGoJsEntities(results.tables),
        transformForeighKeysToLinks);
      this.myDiagram!.model = model;
    });
  }

  private transformToGoJsEntities(tablesInfo: TableInfo[]) {
    return tablesInfo.map((tableInfos: TableInfo) => {
      return {
        key: tableInfos.name,
        visibility: true,
        items: tableInfos.columns.map((columnInfo: any) => {
          return {
            name: columnInfo.name,
            iskey: columnInfo.isPrimary,
            figure: "Decision",
            color: "purple"
          };
        }),
        inheriteditems: []
      };
    });
  }

  private transformForeighKeysToLinks(foreignKeyInfos: ForeignKeyInfo[]) {
    return foreignKeyInfos.map((foreignKeyInfo: ForeignKeyInfo) => {
      return {
        from: foreignKeyInfo.foreignKeyTableName,
        to: foreignKeyInfo.primaryKeyTableName,
        text: "0..N",
        toText: "1"
      };
    });
  }

}
