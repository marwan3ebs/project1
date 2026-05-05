import React, { useMemo, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import {
  Card,
  FormInput,
  PrimaryButton,
  SectionHeader,
  SelectInput,
} from '../components/index.js';
import {
  AGREEMENT_TYPES,
  CUSTOMER_TYPES,
  MARKET_TYPES,
  PROPERTY_TYPES,
  TRANSACTION_TYPES,
  UNIT_SOURCES,
} from '../constants/index.js';
import { addMonths, daysFromToday } from '../utils/dateUtils.js';
import { hasErrors, validatePropertyForm } from '../utils/validation.js';
import { screen } from './screenStyles.js';

function emptyForm(data) {
  const today = daysFromToday(0);
  return {
    agentId: data.agents.find((agent) => agent.role === 'agent')?.id || data.agents[0]?.id || '',
    customerName: '',
    customerPhone: '',
    customerType: 'seller',
    title: '',
    location: '',
    district: '',
    compound: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    view: '',
    finishing: '',
    price: '',
    propertyType: 'apartment',
    transactionType: 'purchase',
    marketType: 'resale',
    agreementCode: '',
    agreementType: 'exclusive',
    agreementStartDate: today,
    agreementEndDate: addMonths(today, 3),
    source: 'leads',
    buyerCommissionPercent: '2.5',
    sellerCommissionPercent: '2.5',
    rentCommission: '',
    notes: '',
  };
}

export function AddPropertyScreen({ data, actions, navigate }) {
  const [form, setForm] = useState(() => emptyForm(data));
  const [errors, setErrors] = useState({});

  const agentOptions = useMemo(
    () =>
      data.agents
        .filter((agent) => agent.role !== 'manager')
        .map((agent) => ({ value: agent.id, label: agent.name })),
    [data.agents],
  );

  function update(key, value) {
    setForm((current) => {
      const next = { ...current, [key]: value };

      if (key === 'agreementStartDate') {
        next.agreementEndDate = addMonths(value, 3);
      }

      if (key === 'transactionType' && value === 'rent') {
        next.agreementType = 'rent';
        next.buyerCommissionPercent = '0';
        next.sellerCommissionPercent = '0';
        next.customerType = current.customerType === 'seller' ? 'landlord' : current.customerType;
      }

      if (key === 'transactionType' && value === 'purchase' && current.agreementType === 'rent') {
        next.agreementType = 'exclusive';
        next.buyerCommissionPercent = '2.5';
        next.sellerCommissionPercent = '2.5';
        next.customerType = current.customerType === 'landlord' ? 'seller' : current.customerType;
      }

      return next;
    });
  }

  function submit() {
    const nextErrors = validatePropertyForm(form);
    setErrors(nextErrors);

    if (hasErrors(nextErrors)) {
      Alert.alert('Missing CRM details', 'Please complete the required fields before saving.');
      return;
    }

    actions.addProperty(form);
  }

  return (
    <View>
      <SectionHeader
        title="Add property agreement"
        subtitle="Create a clean CRM record with agreement and commission data"
        actionLabel="Cancel"
        onAction={() => navigate('inventory')}
      />

      <Card>
        <Text style={screen.title}>Ownership</Text>
        <SelectInput label="Agent" options={agentOptions} value={form.agentId} onChange={(value) => update('agentId', value)} error={errors.agentId} />
        <SelectInput label="Market" options={MARKET_TYPES} value={form.marketType} onChange={(value) => update('marketType', value)} />
        <SelectInput label="Transaction" options={TRANSACTION_TYPES} value={form.transactionType} onChange={(value) => update('transactionType', value)} />
      </Card>

      <Card>
        <Text style={screen.title}>Customer</Text>
        <FormInput label="Customer name" value={form.customerName} onChangeText={(value) => update('customerName', value)} error={errors.customerName} />
        <FormInput label="Customer phone" value={form.customerPhone} onChangeText={(value) => update('customerPhone', value)} keyboardType="phone-pad" error={errors.customerPhone} />
        <SelectInput label="Customer type" options={CUSTOMER_TYPES} value={form.customerType} onChange={(value) => update('customerType', value)} />
      </Card>

      <Card>
        <Text style={screen.title}>Property</Text>
        <SelectInput label="Property type" options={PROPERTY_TYPES} value={form.propertyType} onChange={(value) => update('propertyType', value)} />
        <FormInput label="Property title" value={form.title} onChangeText={(value) => update('title', value)} />
        <FormInput label="Location" value={form.location} onChangeText={(value) => update('location', value)} error={errors.location} />
        <View style={screen.actionRow}>
          <View style={screen.actionFlex}>
            <FormInput label="District" value={form.district} onChangeText={(value) => update('district', value)} />
          </View>
          <View style={screen.actionFlex}>
            <FormInput label="Compound" value={form.compound} onChangeText={(value) => update('compound', value)} />
          </View>
        </View>
        <View style={screen.actionRow}>
          <View style={screen.actionFlex}>
            <FormInput label="Area sqm" value={form.area} onChangeText={(value) => update('area', value)} keyboardType="numeric" error={errors.area} />
          </View>
          <View style={screen.actionFlex}>
            <FormInput label={form.transactionType === 'rent' ? 'Monthly rent' : 'Price'} value={form.price} onChangeText={(value) => update('price', value)} keyboardType="numeric" error={errors.price} />
          </View>
        </View>
        <View style={screen.actionRow}>
          <View style={screen.actionFlex}>
            <FormInput label="Bedrooms" value={form.bedrooms} onChangeText={(value) => update('bedrooms', value)} keyboardType="numeric" />
          </View>
          <View style={screen.actionFlex}>
            <FormInput label="Bathrooms" value={form.bathrooms} onChangeText={(value) => update('bathrooms', value)} keyboardType="numeric" />
          </View>
        </View>
        <View style={screen.actionRow}>
          <View style={screen.actionFlex}>
            <FormInput label="Floor" value={form.floor} onChangeText={(value) => update('floor', value)} />
          </View>
          <View style={screen.actionFlex}>
            <FormInput label="Finishing" value={form.finishing} onChangeText={(value) => update('finishing', value)} />
          </View>
        </View>
        <FormInput label="View" value={form.view} onChangeText={(value) => update('view', value)} />
        <FormInput label="Notes" value={form.notes} onChangeText={(value) => update('notes', value)} multiline />
      </Card>

      <Card>
        <Text style={screen.title}>Agreement and commission</Text>
        <SelectInput label="Agreement type" options={form.transactionType === 'rent' ? AGREEMENT_TYPES.filter((item) => item.value === 'rent') : AGREEMENT_TYPES.filter((item) => item.value !== 'rent')} value={form.agreementType} onChange={(value) => update('agreementType', value)} />
        <SelectInput label="Source" options={UNIT_SOURCES} value={form.source} onChange={(value) => update('source', value)} />
        <View style={screen.actionRow}>
          <View style={screen.actionFlex}>
            <FormInput label="Start date" value={form.agreementStartDate} onChangeText={(value) => update('agreementStartDate', value)} error={errors.agreementStartDate} />
          </View>
          <View style={screen.actionFlex}>
            <FormInput label="End date" value={form.agreementEndDate} onChangeText={(value) => update('agreementEndDate', value)} />
          </View>
        </View>
        {form.transactionType === 'rent' ? (
          <FormInput label="Rent commission" value={form.rentCommission} onChangeText={(value) => update('rentCommission', value)} keyboardType="numeric" />
        ) : (
          <View style={screen.actionRow}>
            <View style={screen.actionFlex}>
              <FormInput label="Buyer %" value={form.buyerCommissionPercent} onChangeText={(value) => update('buyerCommissionPercent', value)} keyboardType="numeric" />
            </View>
            <View style={screen.actionFlex}>
              <FormInput label="Seller %" value={form.sellerCommissionPercent} onChangeText={(value) => update('sellerCommissionPercent', value)} keyboardType="numeric" />
            </View>
          </View>
        )}
      </Card>

      <PrimaryButton label="Save property agreement" onPress={submit} />
    </View>
  );
}
