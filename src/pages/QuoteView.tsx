import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { QuoteSignature } from "@/components/QuoteSignature";
import { Quote } from "@/types/quote";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const QuoteView = () => {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signatureOpen, setSignatureOpen] = useState(false);
  const [signed, setSigned] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.functions.invoke("get-quote", {
          body: { id }
        });

        if (error) throw new Error(error.message);
        if (data?.quote) {
          setQuote(data.quote);
          // Check if the quote is already signed
          if (data.quote.status === "signed" || data.quote.status === "accepted") {
            setSigned(true);
          }
        } else {
          throw new Error("Devis non trouvé");
        }
      } catch (err) {
        setError(err.message || "Une erreur est survenue lors du chargement du devis");
        console.error("Error fetching quote:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuote();
    }
  }, [id]);

  const handleSignatureSuccess = () => {
    setSigned(true);
    setSignatureOpen(false);
    toast.success("Devis signé avec succès", {
      description: "Le devis a été signé et envoyé."
    });
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  if (error) return (
    <div className="flex justify-center items-center h-screen">
      <div className="text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-semibold mb-2">Erreur</h2>
        <p>{error}</p>
      </div>
    </div>
  );
  if (!quote) return <div className="flex justify-center items-center h-screen">Devis non trouvé</div>;

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">Devis {quote.quote_number}</CardTitle>
              <CardDescription>Émis le {format(new Date(quote.issue_date), "dd/MM/yyyy")}</CardDescription>
            </div>
            <div className="text-right">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium 
                            bg-opacity-10 uppercase
                            ${quote.status === 'draft' ? 'bg-gray-200 text-gray-800' : ''} 
                            ${quote.status === 'sent' ? 'bg-blue-200 text-blue-800' : ''}
                            ${quote.status === 'viewed' ? 'bg-purple-200 text-purple-800' : ''}
                            ${quote.status === 'signed' ? 'bg-green-200 text-green-800' : ''}
                            ${quote.status === 'rejected' ? 'bg-red-200 text-red-800' : ''}
                            ${quote.status === 'expired' ? 'bg-amber-200 text-amber-800' : ''}
                            ${quote.status === 'accepted' ? 'bg-emerald-200 text-emerald-800' : ''}
                            ${quote.status === 'invoiced' ? 'bg-teal-200 text-teal-800' : ''}`}>
                {quote.status}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-medium mb-2">De</h3>
              <div className="space-y-1">
                {quote.company?.company_name && <p className="font-medium">{quote.company.company_name}</p>}
                {quote.company?.address && <p className="text-sm text-gray-600">{quote.company.address}</p>}
                {quote.company?.email && <p className="text-sm text-gray-600">{quote.company.email}</p>}
                {quote.company?.phone && <p className="text-sm text-gray-600">{quote.company.phone}</p>}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Pour</h3>
              <div className="space-y-1">
                {quote.client?.client_name && <p className="font-medium">{quote.client.client_name}</p>}
                {quote.client?.address && <p className="text-sm text-gray-600">{quote.client.address}</p>}
                {quote.client?.email && <p className="text-sm text-gray-600">{quote.client.email}</p>}
                {quote.client?.phone && <p className="text-sm text-gray-600">{quote.client.phone}</p>}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-medium mb-4">Détails du devis</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Description</TableHead>
                  <TableHead className="text-right">Qté</TableHead>
                  <TableHead className="text-right">Prix unitaire</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quote.items?.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.description}</TableCell>
                    <TableCell className="text-right">{item.quantity}</TableCell>
                    <TableCell className="text-right">{item.unit_price.toFixed(2)} €</TableCell>
                    <TableCell className="text-right">{item.total_price.toFixed(2)} €</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end">
            <div className="w-full md:w-1/3">
              <div className="flex justify-between py-2">
                <span>Sous-total :</span>
                <span>{quote.subtotal.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Taxes :</span>
                <span>{quote.tax_amount.toFixed(2)} €</span>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between py-2 font-bold">
                <span>Total :</span>
                <span>{quote.total_amount.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {quote.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Notes</h3>
              <p className="text-sm text-gray-600">{quote.notes}</p>
            </div>
          )}

          {quote.validity_date && (
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                Ce devis est valable jusqu'au {format(new Date(quote.validity_date), "dd/MM/yyyy")}.
              </p>
            </div>
          )}

          {quote.signatures && quote.signatures.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-2">Signature</h3>
              <div className="border rounded-md p-4">
                <p className="text-sm mb-2">Signé par: {quote.signatures[0].signed_name}</p>
                <p className="text-sm mb-2">Date: {format(new Date(quote.signatures[0].signed_at), "dd/MM/yyyy")}</p>
                {quote.signatures[0]?.signature_data?.dataUrl && (
                  <div className="mt-2 border rounded p-2 bg-gray-50">
                    <img 
                      src={`data:image/png;base64,${quote.signatures[0]?.signature_data?.dataUrl?.split(',')[1] || ''}`} 
                      alt="Signature" 
                      className="max-h-24"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-gray-500">
            {quote.quote_number} • Créé le {format(new Date(quote.created_at), "dd/MM/yyyy")}
          </p>
          {!signed && !user && (
            <Button onClick={() => setSignatureOpen(true)}>
              Signer le devis
            </Button>
          )}
        </CardFooter>
      </Card>

      <QuoteSignature 
        open={signatureOpen}
        onOpenChange={setSignatureOpen}
        quoteId={quote.id}
        onSuccess={handleSignatureSuccess}
      />
    </div>
  );
};

export default QuoteView;
