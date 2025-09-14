-- Insert sample customers
INSERT INTO public.customers (first_name, last_name, email, phone, company, industry, status, value, tags) VALUES
('John', 'Smith', 'john.smith@techcorp.com', '+1-555-0101', 'TechCorp Inc', 'Technology', 'Active', 75000, ARRAY['vip', 'enterprise']),
('Sarah', 'Johnson', 'sarah.j@innovate.co', '+1-555-0102', 'Innovate Solutions', 'Technology', 'Active', 45000, ARRAY['startup']),
('Michael', 'Brown', 'mbrown@manufacturing.com', '+1-555-0103', 'Brown Manufacturing', 'Manufacturing', 'Prospect', 25000, ARRAY['industrial']),
('Emily', 'Davis', 'emily@healthcare.org', '+1-555-0104', 'Healthcare Plus', 'Healthcare', 'Active', 60000, ARRAY['healthcare', 'priority']),
('Robert', 'Wilson', 'rwilson@finance.biz', '+1-555-0105', 'Wilson Finance', 'Finance', 'Inactive', 15000, ARRAY['small-business']),
('Lisa', 'Anderson', 'lisa@retail.store', '+1-555-0106', 'Anderson Retail', 'Retail', 'Prospect', 35000, ARRAY['retail', 'growing']),
('David', 'Taylor', 'david@consulting.pro', '+1-555-0107', 'Taylor Consulting', 'Consulting', 'Active', 85000, ARRAY['vip', 'consulting']),
('Jennifer', 'Martinez', 'jen@education.edu', '+1-555-0108', 'Martinez Education', 'Education', 'Active', 40000, ARRAY['education', 'non-profit']);

-- Insert sample customer segments
INSERT INTO public.customer_segments (name, description, criteria) VALUES
('VIP Customers', 'High-value customers with significant business potential', '{"rules": [{"field": "value", "operator": "gt", "value": "50000"}, {"field": "status", "operator": "eq", "value": "Active"}]}'),
('Technology Prospects', 'Prospective customers in the technology industry', '{"rules": [{"field": "industry", "operator": "eq", "value": "Technology"}, {"field": "status", "operator": "eq", "value": "Prospect"}]}'),
('Healthcare Segment', 'Active customers in healthcare industry', '{"rules": [{"field": "industry", "operator": "eq", "value": "Healthcare"}, {"field": "status", "operator": "eq", "value": "Active"}]}'),
('High Value Active', 'Active customers with high customer value', '{"rules": [{"field": "value", "operator": "gt", "value": "40000"}, {"field": "status", "operator": "eq", "value": "Active"}]}');

-- Insert sample interactions
INSERT INTO public.interactions (customer_id, type, channel, subject, notes, outcome, duration, next_action) 
SELECT 
    c.id,
    CASE (random() * 4)::int 
        WHEN 0 THEN 'Email'
        WHEN 1 THEN 'Phone'
        WHEN 2 THEN 'Meeting'
        WHEN 3 THEN 'Chat'
        ELSE 'Social'
    END,
    CASE (random() * 3)::int 
        WHEN 0 THEN 'Phone'
        WHEN 1 THEN 'Email'
        WHEN 2 THEN 'In-Person'
        ELSE 'Video Call'
    END,
    CASE (random() * 4)::int 
        WHEN 0 THEN 'Product Demo'
        WHEN 1 THEN 'Price Discussion'
        WHEN 2 THEN 'Contract Negotiation'
        WHEN 3 THEN 'Support Issue'
        ELSE 'General Inquiry'
    END,
    CASE (random() * 4)::int 
        WHEN 0 THEN 'Customer expressed strong interest in our enterprise solution'
        WHEN 1 THEN 'Discussed pricing options and contract terms'
        WHEN 2 THEN 'Provided technical specifications and implementation timeline'
        WHEN 3 THEN 'Resolved billing inquiry and updated account information'
        ELSE 'Initial consultation about service offerings'
    END,
    CASE (random() * 2)::int 
        WHEN 0 THEN 'Positive'
        WHEN 1 THEN 'Neutral'
        ELSE 'Negative'
    END,
    (random() * 120 + 15)::int,
    CASE (random() * 4)::int 
        WHEN 0 THEN 'Send proposal by end of week'
        WHEN 1 THEN 'Schedule follow-up call next week'
        WHEN 2 THEN 'Prepare contract for review'
        WHEN 3 THEN 'Share additional product documentation'
        ELSE 'Wait for customer decision'
    END
FROM customers c
CROSS JOIN generate_series(1, 2) -- 2 interactions per customer
WHERE random() < 0.8; -- 80% chance for each interaction

-- Insert sample support tickets
INSERT INTO public.support_tickets (customer_id, title, description, category, priority, status, assigned_to)
SELECT 
    c.id,
    CASE (random() * 5)::int 
        WHEN 0 THEN 'Login Issues'
        WHEN 1 THEN 'Billing Discrepancy'
        WHEN 2 THEN 'Feature Request'
        WHEN 3 THEN 'Performance Issues'
        WHEN 4 THEN 'Integration Help'
        ELSE 'General Support'
    END,
    CASE (random() * 5)::int 
        WHEN 0 THEN 'Unable to access account after recent password reset'
        WHEN 1 THEN 'Invoice amount does not match agreed pricing'
        WHEN 2 THEN 'Request for additional reporting features'
        WHEN 3 THEN 'System response time has been slower than usual'
        WHEN 4 THEN 'Need help integrating with existing CRM system'
        ELSE 'General inquiry about service capabilities'
    END,
    CASE (random() * 4)::int 
        WHEN 0 THEN 'Technical'
        WHEN 1 THEN 'Billing'
        WHEN 2 THEN 'Feature Request'
        ELSE 'General'
    END,
    CASE (random() * 4)::int 
        WHEN 0 THEN 'Critical'
        WHEN 1 THEN 'High'
        WHEN 2 THEN 'Medium'
        ELSE 'Low'
    END,
    CASE (random() * 4)::int 
        WHEN 0 THEN 'Open'
        WHEN 1 THEN 'In Progress'
        WHEN 2 THEN 'Resolved'
        ELSE 'Closed'
    END,
    CASE (random() * 3)::int 
        WHEN 0 THEN 'John Doe'
        WHEN 1 THEN 'Jane Smith'
        ELSE 'Mike Johnson'
    END
FROM customers c
WHERE random() < 0.6; -- 60% of customers have tickets

-- Insert sample ticket responses
INSERT INTO public.ticket_responses (ticket_id, author, message)
SELECT 
    st.id,
    'Customer',
    'Initial ticket description and problem details'
FROM support_tickets st;

INSERT INTO public.ticket_responses (ticket_id, author, message)
SELECT 
    st.id,
    'Support Agent',
    CASE (random() * 3)::int 
        WHEN 0 THEN 'Thank you for contacting us. We are looking into this issue and will get back to you shortly.'
        WHEN 1 THEN 'I have reviewed your account and found the issue. Let me provide you with a solution.'
        ELSE 'We have implemented the fix for your issue. Please let us know if you need any further assistance.'
    END
FROM support_tickets st
WHERE random() < 0.8;