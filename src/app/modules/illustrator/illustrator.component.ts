import {Component, ViewEncapsulation} from "@angular/core";
import {GojsAngularModule} from "gojs-angular";
import * as go from 'gojs';

@Component({
  selector: "illustrator",
  templateUrl: "illustrator.component.html",
  styleUrls: ["illustrator.component.scss"],
  standalone: true,
  imports: [
    GojsAngularModule
  ],
  encapsulation: ViewEncapsulation.None
})
export class IllustratorComponent {
  public diagramDivClassName: string = 'myDiagramDiv';
  public paletteDivClassName = 'myPaletteDiv';

  nodeDataArray = [
    {
      key: "My Entity", visibility: true, location: new go.Point(0, 0),
      items: [{name: "EntityID", iskey: true, figure: "Decision", color: "purple"},
        {name: "EntityName", iskey: false, figure: "Hexagon", color: "blue"},
        {name: "EntityDescription", iskey: false, figure: "Hexagon", color: "blue"},
        {name: "EntityIcon", iskey: false, figure: "TriangleUp", color: "red"}],
    },
    {
      key: "Products", visibility: true, location: new go.Point(250, 250),
      items: [{name: "ProductID", iskey: true, figure: "Decision", color: "purple"},
        {name: "ProductName", iskey: false, figure: "Hexagon", color: "blue"},
        {name: "ItemDescription", iskey: false, figure: "Hexagon", color: "blue"},
        {name: "WholesalePrice", iskey: false, figure: "Circle", color: "green",},
        {name: "ProductPhoto", iskey: false, figure: "TriangleUp", color: "red"}],
      inheriteditems: [{name: "SupplierID", iskey: false, figure: "Decision", color: "purple"},
        {name: "CategoryID", iskey: false, figure: "Decision", color: "purple"}]
    },
    {
      key: "Suppliers", visibility: false, location: new go.Point(600, 0),
      items: [{name: "SupplierID", iskey: true, figure: "Decision", color: "purple"},
        {name: "CompanyName", iskey: false, figure: "Hexagon", color: "blue"},
        {name: "ContactName", iskey: false, figure: "Hexagon", color: "blue"},
        {name: "Address", iskey: false, figure: "Hexagon", color: "blue"},
        {name: "ShippingDistance", iskey: false, figure: "Circle", color: "green",},
        {name: "Logo", iskey: false, figure: "TriangleUp", color: "red"}],
      inheriteditems: []
    },
    {
      key: "Categories", visibility: true, location: new go.Point(250, 30),
      items: [{name: "CategoryID", iskey: true, figure: "Decision", color: "purple"},
        {name: "CategoryName", iskey: false, figure: "Hexagon", color: "blue"},
        {name: "Description", iskey: false, figure: "Hexagon", color: "blue"},
        {name: "Icon", iskey: false, figure: "TriangleUp", color: "red"}],
      inheriteditems: [{name: "SupplierID", iskey: false, figure: "Decision", color: "purple"}]
    },
    {
      key: "Order Details", visibility: true, location: new go.Point(600, 350),
      items: [{name: "OrderID", iskey: true, figure: "Decision", color: "purple"},
        {name: "UnitPrice", iskey: false, figure: "Circle", color: "green",},
        {name: "Quantity", iskey: false, figure: "Circle", color: "green",},
        {name: "Discount", iskey: false, figure: "Circle", color: "green"}],
      inheriteditems: [{name: "ProductID", iskey: true, figure: "Decision", color: "purple"}]
    },
  ];

  public state = {
    // Diagram state props
    diagramNodeData: [
      { id: 'Alpha', text: "Alpha", color: 'lightblue' },
      { id: 'Beta', text: "Beta", color: 'orange' }
    ],
    diagramLinkData: [
      { key: -1, from: 'Alpha', to: 'Beta' }
    ],
    diagramModelData: { prop: 'value' },
    skipsDiagramUpdate: false,

    // Palette state props
    paletteNodeData: [
      { key: 'PaletteNode1', color: 'firebrick' },
      { key: 'PaletteNode2', color: 'blueviolet' }
    ]
  };

  public initDiagram(): go.Diagram {
    const $ = go.GraphObject.make;
    const dia = new go.Diagram({
      'undoManager.isEnabled': true,
      model: new go.GraphLinksModel(
        {
          nodeKeyProperty: 'id',
          linkKeyProperty: 'key' // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
        }
      )
    });

    // define the Node template
    dia.nodeTemplate =
      $(go.Node, 'Auto',
        $(go.Shape, 'RoundedRectangle', { stroke: null },
          new go.Binding('fill', 'color')
        ),
        $(go.TextBlock, { margin: 8, editable: true },
          new go.Binding('text').makeTwoWay())
      );
    return dia;
  }

  public diagramModelChange = function(changes: go.IncrementalData) {
    console.log(changes);
    // see gojs-angular-basic for an example model changed handler that preserves immutability
    // when setting state, be sure to set skipsDiagramUpdate: true since GoJS already has this update
  };

  public initPalette(): go.Palette {
    const $ = go.GraphObject.make;
    const palette = $(go.Palette);

    // define the Node template
    palette.nodeTemplate =
      $(go.Node, 'Auto',
        $(go.Shape, 'RoundedRectangle', { stroke: null },
          new go.Binding('fill', 'color')
        ),
        $(go.TextBlock, { margin: 8 },
          new go.Binding('text', 'key'))
      );

    palette.model = new go.GraphLinksModel(
      {
        linkKeyProperty: 'key'  // IMPORTANT! must be defined for merges and data sync when using GraphLinksModel
      });

    return palette;
  }
}
