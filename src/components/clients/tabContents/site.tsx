import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Site() {
  const sites = [
    {
      status: "Running",
      siteName: "FOG",
      siteInstruction: "Site address:",
      address: "Ut atque soluta quas",
      guardsRequired: 3,
      personnel: [
        { name: "Client name", status: "on-duty" },
        { name: "Client name", status: "on-duty" },
        { name: "Client name", status: "day-off" }
      ]
    },
    {
      status: "Connected",
      siteName: "FOG",
      siteInstruction: "Site address:",
      address: "Ut atque soluta quas",
      guardsRequired: 3,
      personnel: [
        { name: "Client name", status: "present" },
        { name: "Client name", status: "present" },
        { name: "Client name", status: "present" }
      ]
    }
  ];

  const getStatusVariant = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "default";
      case "connected":
        return "secondary";
      case "on-duty":
        return "default";
      case "day-off":
        return "outline";
      case "present":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "running":
        return "bg-green-500";
      case "connected":
        return "bg-blue-500";
      case "on-duty":
        return "bg-green-500";
      case "day-off":
        return "bg-gray-500";
      case "present":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      {sites.map((site, index) => (
        <div key={index} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Info Content Column */}
          <Card className="w-full">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl font-bold">{site.siteName}</CardTitle>
                  <CardDescription className="mt-1">{site.siteInstruction}</CardDescription>
                  <p className="text-sm text-muted-foreground mt-1">{site.address}</p>
                </div>
                <Badge 
                  variant={getStatusVariant(site.status)}
                  className="flex items-center gap-1"
                >
                  <span 
                    className={`w-2 h-2 rounded-full ${getStatusColor(site.status)}`}
                  />
                  {site.status}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Number of guards required:</span>
                <Badge variant="outline">{site.guardsRequired}</Badge>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Personnel Status:</h4>
                <div className="space-y-2">
                  {site.personnel.map((person, personIndex) => (
                    <div key={personIndex} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{person.name}</span>
                      </div>
                      <Badge 
                        variant={getStatusVariant(person.status)}
                        className="flex items-center gap-1"
                      >
                        <span 
                          className={`w-2 h-2 rounded-full ${getStatusColor(person.status)}`}
                        />
                        {person.status === "on-duty" ? "On Duty" : 
                        person.status === "day-off" ? "Day Off" : "Present"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Map Column */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle className="text-lg">Site Location</CardTitle>
              <CardDescription>Map view of the site</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="mb-2">🗺️</div>
                  <p className="text-sm">Map Component</p>
                  <p className="text-xs mt-1">{site.address}</p>
                </div>
                {/* Replace this div with your actual map component */}
                {/* <MapComponent address={site.address} /> */}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  );
}